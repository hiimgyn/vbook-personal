load('bypass.js');
load('config.js');

// Helper function để tạo fallback URLs
function createFallbackUrls(mainUrl, dataSv1, dataSv2) {
    let fallbackUrls = [];
    
    // Thêm server dự phòng từ data attributes
    if (dataSv1 && dataSv1 !== mainUrl) {
        if (dataSv1.startsWith("//")) {
            dataSv1 = "https:" + dataSv1;
        }
        fallbackUrls.push(dataSv1);
    }
    
    if (dataSv2 && dataSv2 !== mainUrl && dataSv2 !== dataSv1) {
        if (dataSv2.startsWith("//")) {
            dataSv2 = "https:" + dataSv2;
        }
        fallbackUrls.push(dataSv2);
    }
    
    // Thêm domain alternatives
    let domainAlternatives = [
        { from: "kcgsbok.com", to: ["kxcdn.com", "vncdnimg.com", "cdnimg.net"] },
        { from: "viestorage.com", to: ["vieestorage.com"] },
        { from: "nettruyenhe.com", to: ["nettruyenvia.com"] }
    ];
    
    for (let i = 0; i < domainAlternatives.length; i++) {
        let alt = domainAlternatives[i];
        if (mainUrl.indexOf(alt.from) > -1) {
            for (let j = 0; j < alt.to.length; j++) {
                fallbackUrls.push(mainUrl.replace(alt.from, alt.to[j]));
            }
        }
    }
    
    // Thêm Google Proxy làm fallback cuối cùng
    fallbackUrls.push('https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&gadget=a&no_expand=1&resize_h=0&rewriteMime=image/*&url=' + encodeURIComponent(mainUrl));
    
    return fallbackUrls;
}

function execute(url) {
    let result = fetchWithBackup(url);
    if (!result) {
        return null;
    }
    
    let response = result.response;
    let currentHost = result.currentHost;
    
    if (response.ok) {
        let doc = bypass(url, response.html());
        let data = [];
        if(doc) {
            // Log thông tin debug nếu cần
            let pageImages = doc.select(".page-chapter img");
            if (pageImages.size() === 0) {
                // Thử selector khác nếu không tìm thấy ảnh
                pageImages = doc.select(".reading-detail img");
            }
            
            pageImages.forEach(function(e) {
                // Thử lấy URL ảnh từ các thuộc tính khác nhau theo thứ tự ưu tiên
                let img = e.attr("src") || e.attr("data-src") || e.attr("data-original");
                let dataSv1 = e.attr('data-sv1');
                let dataSv2 = e.attr('data-sv2');
                
                if (img) {
                    // Chuẩn hóa URL nếu bắt đầu bằng //
                    if (img.startsWith("//")) {
                        img = "https:" + img;
                    }
                    
                    // Tạo danh sách fallback URLs sử dụng helper function
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
    }
    return null;
}