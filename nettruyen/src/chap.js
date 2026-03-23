load('bypass.js');
load('config.js');
function normalizeUrl(u, base) {
    if (!u) return null;
    if (u.startsWith("//")) return "https:" + u;
    try {
        return new URL(u, base).href;
    } catch (e) {
        return u;
    }
}

function createFallbackUrls(mainUrl, dataSv1, dataSv2) {
    if (!mainUrl) return [];
    mainUrl = normalizeUrl(mainUrl, mainUrl);
    let fallbackUrls = [];
    let addedUrls = new Set([mainUrl]);

    function addFallback(url) {
        if (!url) return;
        let n = normalizeUrl(url, mainUrl);
        if (n && !addedUrls.has(n)) {
            fallbackUrls.push(n);
            addedUrls.add(n);
        }
    }

    addFallback(dataSv1);
    addFallback(dataSv2);

    if (mainUrl.indexOf("viestorage.com") > -1) {
        addFallback(mainUrl.replace("viestorage.com", "vieestorage.com"));
    }

    return fallbackUrls;
}

// Prefer this host when present in candidates
const PREFERRED_HOST = 'image4.kcgsbok.com';

function execute(url) {
    let result = fetchWithBackup(url);
    if (!result) {
        return null;
    }

    let response = result.response;
    let currentHost = result.currentHost;

    if (!response.ok) {
        return null;
    }

    let doc = enhancedBypass(url, response.html());
    if (!doc) {
        return null;
    }

    let pageImages = doc.select(".page-chapter img, .reading-detail img");
    if (pageImages.size() === 0) return null;

    let data = [];

    // Simplified loop similar to truyenqq: prefer PREFERRED_HOST when available
    for (let i = 0; i < pageImages.size(); i++) {
        let e = pageImages.get(i);
        let src = e.attr('data-src') || e.attr('data-original') || e.attr('src');
        if (!src) continue;
        src = normalizeUrl(src, url);

        let sv1 = e.attr('data-sv1');
        let sv2 = e.attr('data-sv2');

        let fallbackUrls = createFallbackUrls(src, sv1, sv2);
        let candidates = [src].concat(fallbackUrls || []);

        // choose preferred host if present
        let chosen = src;
        for (let j = 0; j < candidates.length; j++) {
            let u = candidates[j];
            if (!u) continue;
            if (u.indexOf(PREFERRED_HOST) > -1) { chosen = u; break; }
        }

        // build fallback list excluding chosen, keep unique order
        let seen = new Set();
        let finalFallback = [];
        for (let j = 0; j < candidates.length; j++) {
            let u = candidates[j];
            if (!u || u === chosen) continue;
            if (!seen.has(u)) { seen.add(u); finalFallback.push(u); }
        }

        data.push({ link: chosen, fallback: finalFallback, host: currentHost });
    }

    return Response.success(data);
}