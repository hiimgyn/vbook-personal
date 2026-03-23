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
                if (v && fallback.indexOf(v) === -1) fallback.push(v);
            }

            if (link !== null) {
                // Prefer image4.kcgsbok.com as the primary host for kcg/viestorage images
                // Normalize any viestorage or kcgsbok variants to image4.kcgsbok.com
                if (link.indexOf("vieestorage.com") > -1 || link.indexOf("viestorage.com") > -1 || link.indexOf("i4.viestorage.com") > -1) {
                    link = link.replace(/vieestorage\.com|viestorage\.com|i4\.viestorage\.com/g, "image4.kcgsbok.com");
                } else if (link.indexOf("kcgsbok.com") > -1 || link.indexOf("image4.kcgsbok.com") > -1) {
                    link = link.replace(/image4\.kcgsbok\.com|kcgsbok\.com/g, "image4.kcgsbok.com");
                }
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
