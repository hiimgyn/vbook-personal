load('bypass.js');
load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let doc = bypass(url, fetch(url).html());
    if (doc) {
        // support different html image patterns: lazy, lozad, regular
        // NetTruyen uses `.reading-detail` / `.page-chapter` containers, not `.chapter_content`
        let imgs = doc.select(".reading-detail img.lazy, .reading-detail img.lozad, .reading-detail img");
        let data = [];
        // helper: normalize known image hosts and collapse duplicate subdomains
        function normalizeUrl(u) {
            if (!u) return u;
            // ensure protocol for protocol-relative URLs
            if (u.indexOf('http') !== 0) u = u.replace(/^\/\//, 'https://');

            // normalize viestorage variants to canonical image4 host
            if (/vieestorage\.com|viestorage\.com|i4\.viestorage\.com/.test(u)) {
                u = u.replace(/(?:https?:)?(?:\/\/)?(?:[^\/]*)?(?:vieestorage\.com|viestorage\.com|i4\.viestorage\.com)/, 'https://image4.kcgsbok.com');
                return u;
            }

            // handle kcgsbok hosts with possible repeated imageN prefixes
            if (/kcgsbok\.com/.test(u)) {
                // find all imageN occurrences, prefer the last one if present
                let imgs = u.match(/image\d+/g);
                if (imgs && imgs.length > 0) {
                    let last = imgs[imgs.length - 1];
                    u = u.replace(/(?:https?:)?(?:\/\/)?(?:[^\/]*)?(?:image(?:\d+\.)+kcgsbok\.com|kcgsbok\.com)/, 'https://' + last + '.kcgsbok.com');
                    return u;
                }
                // no imageN prefix found, default to image4.kcgsbok.com
                u = u.replace(/(?:https?:)?(?:\/\/)?(?:[^\/]*)?kcgsbok\.com/, 'https://image4.kcgsbok.com');
                return u;
            }

            return u;
        }

        for (let i = 0; i < imgs.size(); i++) {
            let e = imgs.get(i);
            // gather possible sources in priority order
            let srcCandidates = [];
            let ds = e.attr("data-src"); if (ds) srcCandidates.push(ds);
            let dor = e.attr("data-original"); if (dor) srcCandidates.push(dor);
            let sv1 = e.attr("data-sv1"); if (sv1) srcCandidates.push(sv1);
            let sv2 = e.attr("data-sv2"); if (sv2) srcCandidates.push(sv2);
            let src = e.attr("src"); if (src) srcCandidates.push(src);

            // pick first non-empty candidate
            let link = null;
            for (let j = 0; j < srcCandidates.length; j++) {
                if (srcCandidates[j] !== undefined && srcCandidates[j] !== null && srcCandidates[j] !== "") {
                    link = srcCandidates[j];
                    break;
                }
            }

            // normalize and add fallback array (unique)
            let fallback = [];
            for (let j = 0; j < srcCandidates.length; j++) {
                let v = srcCandidates[j];
                if (v) {
                    let nv = normalizeUrl(v);
                    if (fallback.indexOf(nv) === -1) fallback.push(nv);
                }
            }

            if (link !== null) {
                // normalize primary link to canonical host
                link = normalizeUrl(link);
            }

            data.push({
                link: link,
                fallback: fallback
            });
        }
        return Response.success(data);
    }
    return null;
}
