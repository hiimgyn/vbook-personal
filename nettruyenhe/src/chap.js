load('config.js');
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        let data = [];
        doc.select(".page-chapter img").forEach(e => {
            // Thử lấy URL ảnh từ các thuộc tính khác nhau
            let img = e.attr("data-src") || e.attr("src") || e.attr("data-original");
            let dataSv1 = e.attr('data-sv1');
            let dataSv2 = e.attr('data-sv2');
            
            if (img) {
                // Chuẩn hóa URL nếu bắt đầu bằng //
                if (img.startsWith("//")) {
                    img = "https:" + img;
                }
                
                // Tạo danh sách fallback từ các server dự phòng
                let fallbackUrls = [];
                if (dataSv1) {
                    if (dataSv1.startsWith("//")) {
                        dataSv1 = "https:" + dataSv1;
                    }
                    fallbackUrls.push(dataSv1);
                }
                if (dataSv2) {
                    if (dataSv2.startsWith("//")) {
                        dataSv2 = "https:" + dataSv2;
                    }
                    fallbackUrls.push(dataSv2);
                }
                
                data.push({
                    link: img,
                    fallback: fallbackUrls
                });
            }
        });
        return Response.success(data);
    }
    return null;
}