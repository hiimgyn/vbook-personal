load('config.js');

function execute() {
    return Response.success([
        {title: "Ẩm thực - Nấu ăn", input: BASE_URL + "/category/am-thuc-nau-an", script: "gen.js"},
        {title: "Cổ Tích - Thần Thoại", input: BASE_URL + "/category/co-tich-than-thoai", script: "gen.js"},
        {title: "Công Nghệ Thông Tin", input: BASE_URL + "/category/cong-nghe-thong-tin", script: "gen.js"},
        {title: "Học Ngoại Ngữ", input: BASE_URL + "/category/hoc-ngoai-ngu", script: "gen.js"},
        {title: "Hồi Ký - Tuỳ Bút", input: BASE_URL + "/category/hoi-ky-tuy-but", script: "gen.js"},
        {title: "Huyền bí - Giả Tưởng", input: BASE_URL + "/category/huyen-bi-gia-tuong", script: "gen.js"},
        {title: "Khoa Học - Kỹ Thuật", input: BASE_URL + "/category/khoa-hoc-ky-thuat", script: "gen.js"},
        {title: "Kiếm Hiệp - Tiên Hiệp", input: BASE_URL + "/category/kiem-hiep-tien-hiep", script: "gen.js"},
        {title: "Kiến Trúc - Xây Dựng", input: BASE_URL + "/category/kien-truc-xay-dung", script: "gen.js"},
        {title: "Kinh Tế - Quản Lý", input: BASE_URL + "/category/kinh-te-quan-ly", script: "gen.js"},
        {title: "Lịch Sử - Chính Trị", input: BASE_URL + "/category/lich-su-chinh-tri", script: "gen.js"},
        {title: "Marketing - Bán hàng", input: BASE_URL + "/category/marketing-ban-hang", script: "gen.js"},
        {title: "Nông - Lâm - Ngư", input: BASE_URL + "/category/nong-lam-ngu", script: "gen.js"},
        {title: "Phiêu Lưu - Mạo Hiểm", input: BASE_URL + "/category/phieu-luu-mao-hiem", script: "gen.js"},
        {title: "Sách Giáo Khoa", input: BASE_URL + "/category/sach-giao-khoa", script: "gen.js"},
        {title: "Sách nói miễn phí", input: BASE_URL + "/category/sach-noi-mien-phi", script: "gen.js"},
        {title: "Tâm Lý - Kỹ Năng Sống", input: BASE_URL + "/category/tam-ly-ky-nang-song", script: "gen.js"},
        {title: "Thể Thao - Nghệ Thuật", input: BASE_URL + "/category/the-thao-nghe-thuat", script: "gen.js"},
        {title: "Thơ Hay", input: BASE_URL + "/category/tho-hay", script: "gen.js"},
        {title: "Thư Viện Pháp Luật", input: BASE_URL + "/category/thu-vien-phap-luat", script: "gen.js"},
        {title: "Tiểu Thuyết Phương Tây", input: BASE_URL + "/category/tieu-thuyet-phuong-tay", script: "gen.js"},
        {title: "Tiểu Thuyết Trung Quốc", input: BASE_URL + "/category/tieu-thuyet-trung-quoc", script: "gen.js"},
        {title: "Triết Học", input: BASE_URL + "/category/triet-hoc", script: "gen.js"},
        {title: "Trinh Thám - Hình Sự", input: BASE_URL + "/category/trinh-tham-hinh-su", script: "gen.js"},
        {title: "Truyện Cười - Tiếu Lâm", input: BASE_URL + "/category/truyen-cuoi-tieu-lam", script: "gen.js"},
        {title: "Truyện Ma - Truyện Kinh Dị", input: BASE_URL + "/category/truyen-ma-truyen-kinh-di", script: "gen.js"},
        {title: "Truyện Ngắn - Ngôn Tình", input: BASE_URL + "/category/truyen-ngan-ngon-tinh", script: "gen.js"},
        {title: "Truyên Teen - Tuổi Học Trò", input: BASE_URL + "/category/truyen-teen-tuoi-hoc-tro", script: "gen.js"},
        {title: "Truyện Tranh", input: BASE_URL + "/category/truyen-tranh", script: "gen.js"},
        {title: "Tử Vi - Phong Thủy", input: BASE_URL + "/category/tu-vi-phong-thuy", script: "gen.js"},
        {title: "Văn Hóa - Tôn Giáo", input: BASE_URL + "/category/van-hoa-ton-giao", script: "gen.js"},
        {title: "Văn Học Việt Nam", input: BASE_URL + "/category/van-hoc-viet-nam", script: "gen.js"},
        {title: "Y Học - Sức Khỏe", input: BASE_URL + "/category/y-hoc-suc-khoe", script: "gen.js"}
    ]);
}