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

    pageImages.forEach(function(e) {
        let img = e.attr("src") || e.attr("data-src") || e.attr("data-original");
        if (!img) return;
        img = normalizeUrl(img, url);

        let dataSv1 = e.attr('data-sv1');
        let dataSv2 = e.attr('data-sv2');

        let fallbackUrls = createFallbackUrls(img, dataSv1, dataSv2);

        data.push({
            link: img,
            fallback: fallbackUrls,
            host: currentHost
        });
    });

    return Response.success(data);
}