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

// Hosts to prioritize when available (user-requested host)
const PRIORITY_HOSTS = ['image4.kcgsbok.com'];
// Limit number of fallback URLs to avoid extra work and long retries
const MAX_FALLBACKS = 3;

function prioritizeCandidate(candidates) {
    if (!candidates || candidates.length === 0) return null;
    for (let i = 0; i < candidates.length; i++) {
        let u = candidates[i];
        if (!u) continue;
        for (let j = 0; j < PRIORITY_HOSTS.length; j++) {
            if (u.indexOf(PRIORITY_HOSTS[j]) > -1) return u;
        }
    }
    return null;
}

function uniqueExcept(exclude, list) {
    let seen = new Set();
    let out = [];
    for (let i = 0; i < list.length; i++) {
        let u = list[i];
        if (!u || u === exclude) continue;
        if (!seen.has(u)) { seen.add(u); out.push(u); }
    }
    return out;
}

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

    // Use a plain for-loop for slightly better performance than forEach
    for (let i = 0; i < pageImages.size(); i++) {
        let e = pageImages.get(i);

        // Read raw attributes first (avoid normalizing unless needed)
        let rawImg = e.attr('data-src') || e.attr('data-original') || e.attr('src');
        if (!rawImg) continue;

        let dataSv1 = e.attr('data-sv1');
        let dataSv2 = e.attr('data-sv2');

        // Quick check for prioritized host among raw candidates (cheap substring checks)
        let prioritizedRaw = prioritizeCandidate([rawImg, dataSv1, dataSv2]);

        if (prioritizedRaw) {
            // Normalize only the prioritized URL and a few fallbacks
            let pri = normalizeUrl(prioritizedRaw, url);

            // Build limited fallback list by normalizing at most MAX_FALLBACKS other candidates
            let newFallback = [];
            let added = new Set();
            for (let j = 0; j < 3; j++) {
                let cand = (j === 0) ? rawImg : (j === 1 ? dataSv1 : dataSv2);
                if (!cand) continue;
                if (cand === prioritizedRaw) continue;
                let n = normalizeUrl(cand, pri || url);
                if (n && !added.has(n)) { newFallback.push(n); added.add(n); }
                if (newFallback.length >= MAX_FALLBACKS) break;
            }

            data.push({ link: pri, fallback: newFallback, host: currentHost });
        } else {
            // No prioritized host found — normalize main image once and compute fallbacks
            let main = normalizeUrl(rawImg, url);
            let fallbackUrls = createFallbackUrls(main, dataSv1, dataSv2);
            if (fallbackUrls.length > MAX_FALLBACKS) fallbackUrls = fallbackUrls.slice(0, MAX_FALLBACKS);
            data.push({ link: main, fallback: fallbackUrls, host: currentHost });
        }
    }

    return Response.success(data);
}