load('bypass.js');
load('config.js');

function convertToViestorage(url) {
    // Chỉ convert nếu URL chứa kcgsbok, không động vào domain khác
    if (!url.includes('kcgsbok')) {
        return url;  // Giữ nguyên viestorage, nettruyenviet, v.v.
    }
    
    // Case 1: image4.kcgsbok.com → i4.viestorage.com
    if (url.includes('image') && url.includes('kcgsbok.com')) {
        return url.replace(/image(\d+)\.kcgsbok\.com/, 'i$1.viestorage.com');
    }
    
    // Case 2: kcgsbok.com → i4.viestorage.com
    if (url.includes('kcgsbok.com')) {
        return url.replace(/kcgsbok\.com/, 'i4.viestorage.com');
    }
    
    return url;
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
            if (img.startsWith("//")) {
                img = "https:" + img;
            }

            let mainLink = convertToViestorage(img);
            
            let fallbackUrls = [];
            let addedUrls = new Set();  
            
            function addFallback(url) {
                if (url && url !== mainLink && !addedUrls.has(url)) {
                    fallbackUrls.push(url);
                    addedUrls.add(url);
                }
            }
            
            if (img !== mainLink) {
                addFallback(img);
            }
            
            let sv1 = e.attr("data-sv1");
            if (sv1) {
                if (sv1.startsWith("//")) sv1 = "https:" + sv1;
                let vieSv1 = convertToViestorage(sv1);
                addFallback(vieSv1);
                addFallback(sv1);
            }
            
            let sv2 = e.attr("data-sv2");
            if (sv2) {
                if (sv2.startsWith("//")) sv2 = "https:" + sv2;
                let vieSv2 = convertToViestorage(sv2);
                addFallback(vieSv2);
                addFallback(sv2);
            }

            data.push({
                link: mainLink,  
                fallback: fallbackUrls,
                host: currentHost,
                referer: "https://nettruyenhe.com/",  
                alternativeReferers: alternativeReferers
            });
        }
    });

    return Response.success(data);
}