load('bypass.js');
load('config.js');

function normalizeUrl(url) {
    return url && url.startsWith("//") ? "https:" + url : url;
}

function createFallbackUrls(mainUrl) {
    let fallbackUrls = [];
    let vieStorageUrl = mainUrl.replace(/image(\d+)\.kcgsbok\.com/, 'i$1.viestorage.com');
    
    if (vieStorageUrl !== mainUrl) {
        fallbackUrls.push(vieStorageUrl);
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

    let referer = "https://nettruyenhe.com/";
    
    let alternativeReferers = [
        "https://nettruyenviet1.com/",
    ];

    let pageImages = doc.select(".page-chapter img");
    if (pageImages.size() === 0) {
        pageImages = doc.select(".reading-detail img");
    }

    if (pageImages.size() === 0) {
        return null;
    }

    let data = [];

    pageImages.forEach(function(e) {
        let img = e.attr("src") || e.attr("data-src") || e.attr("data-original");

        if (img) {
            img = normalizeUrl(img);

            let fallbackUrls = [];
            
            let vieStorageFallbacks = createFallbackUrls(img);
            fallbackUrls = fallbackUrls.concat(vieStorageFallbacks);
            
            let sv1 = e.attr("data-sv1");
            if (sv1) {
                fallbackUrls.push(normalizeUrl(sv1));
            }
            
            let sv2 = e.attr("data-sv2");
            if (sv2) {
                fallbackUrls.push(normalizeUrl(sv2));
            }

            let imageReferer = referer;
            if (img.includes("viestorage.com")) {
                imageReferer = "https://nettruyenhe.com/";
            } else if (img.includes("kcgsbok.com")) {
                imageReferer = "https://nettruyenviet1.com/";
            }

            data.push({
                link: img,
                fallback: fallbackUrls,
                host: currentHost,
                referer: imageReferer,
                alternativeReferers: alternativeReferers
            });
        }
    });

    return Response.success(data);
}