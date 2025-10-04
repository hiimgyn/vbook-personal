const BASE_URL = 'https://nhasachmienphi.com';

function execute(url) {
	let response = fetch(url);
	if (response.ok) {
		let doc = response.html();
		// Lấy ảnh bìa
		let cover = doc.select(".book_avatar img, .entry img, .item-thumb img").first().attr("src");
		if (!cover) {
			cover = doc.select('meta[property="og:image"]').attr('content');
		}
		if (cover && cover.startsWith("//")) {
			cover = "https:" + cover;
		}
		// Lấy tên sách/truyện
		let name = doc.select("h1[itemprop=name], h1.entry-title, .book_name").first().text();
		if (!name) {
			name = doc.select('meta[property="og:title"]').attr("content");
		}
		// Lấy tác giả
		let author = doc.select(".author, .org, .book_author").first().text();
		if (!author) {
			author = doc.select('meta[property="article:author"]').attr("content");
		}
		if (!author) author = "Đang cập nhật";
		// Lấy mô tả
		let description = doc.select(".story-detail-info, .item-desc, .detail-content, .entry-content").first().html();
		if (!description) {
			description = doc.select('meta[name="description"]').attr("content");
			if (!description) {
				description = doc.select('meta[property="og:description"]').attr("content");
			}
		}
		// Lấy chi tiết
		let detail = doc.select(".book_info .txt, .detail-info, .entry-content, .detail").first().html();
		// Kiểm tra trạng thái
		let ongoing = false;
		let statusText = doc.select(".book_info .txt, .status, .entry-status").first().text();
		if (statusText && statusText.indexOf("Đang Cập Nhật") >= 0) ongoing = true;
		// Lấy thể loại
		let genres = [];
		doc.select(".genres a, .post-tag a, .book_genre a").forEach(function(e) {
			genres.push({
				title: e.text(),
				input: e.attr("href"),
				script: "gen.js"
			});
		});
		return Response.success({
			name: name,
			cover: cover,
			host: BASE_URL,
			author: author,
			description: description,
			detail: detail,
			ongoing: ongoing,
			genres: genres
		});
	}
	return null;
}
