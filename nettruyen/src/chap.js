load('bypass.js');
load('config.js');

// Helper function để chuẩn hóa URL
function normalizeUrl(url) {
    return url && url.startsWith("//") ? "https:" + url : url;
}

// Helper function để tạo fallback URLs từ viestorage
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

    // Lấy base URL để làm Referer cho ảnh
    let baseUrl = url.match(/^https?:\/\/[^\/]+/);
    let referer = baseUrl ? baseUrl[0] + "/" : url;

    // Tìm images - thử selector chính trước
    let pageImages = doc.select(".page-chapter img");
    if (pageImages.size() === 0) {
        // Fallback selector
        pageImages = doc.select(".reading-detail img");
    }

    if (pageImages.size() === 0) {
        return null;
    }

    let data = [];

    // Duyệt qua các ảnh và xử lý song song nếu có thể
    pageImages.forEach(function(e) {
        // Lấy URL ảnh - ưu tiên src đã load, sau đó data-src, data-original
        let img = e.attr("src") || e.attr("data-src") || e.attr("data-original");

        if (img) {
            // Chuẩn hóa URL
            img = normalizeUrl(img);

            // Tạo fallback URLs từ các thuộc tính data-sv1, data-sv2
            let fallbackUrls = [];
            
            // Thêm data-sv1 nếu có
            let sv1 = e.attr("data-sv1");
            if (sv1) {
                fallbackUrls.push(normalizeUrl(sv1));
            }
            
            // Thêm data-sv2 nếu có
            let sv2 = e.attr("data-sv2");
            if (sv2) {
                fallbackUrls.push(normalizeUrl(sv2));
            }
            
            // Thêm viestorage fallback
            let vieStorageFallbacks = createFallbackUrls(img);
            fallbackUrls = fallbackUrls.concat(vieStorageFallbacks);

            data.push({
                link: img,
                fallback: fallbackUrls,
                host: currentHost,
                referer: referer
            });
        }
    });

    return Response.success(data);
}