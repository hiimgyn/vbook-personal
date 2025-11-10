load('bypass.js');
load('config.js');

function createFallbackUrls(mainUrl, dataSv1, dataSv2) {
    let fallbackUrls = [];
    let addedUrls = new Set([mainUrl]);  
    
    function addFallback(url) {
        if (url && !addedUrls.has(url)) {
            fallbackUrls.push(url);
            addedUrls.add(url);
        }
    }
    
    if (dataSv1) {
        if (dataSv1.startsWith("//")) {
            dataSv1 = "https:" + dataSv1;
        }
        addFallback(dataSv1);
    }
    
    if (dataSv2) {
        if (dataSv2.startsWith("//")) {
            dataSv2 = "https:" + dataSv2;
        }
        addFallback(dataSv2);
    }
    
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
        let dataSv1 = e.attr('data-sv1');
        let dataSv2 = e.attr('data-sv2');

        if (img) {
            if (img.startsWith("//")) {
                img = "https:" + img;
            }

            let fallbackUrls = createFallbackUrls(img, dataSv1, dataSv2);

            data.push({
                link: img,  
                fallback: fallbackUrls,
                host: currentHost
            });
        }
    });

    return Response.success(data);
}