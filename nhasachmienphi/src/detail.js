const BASE_URL = 'https://nhasachmienphi.com';

function execute(url) {
	let response = fetch(url);
	if (response.ok) {
		let doc = response.html();
		// Lấy ảnh bìa
		let cover = doc.select(".col-xs-12.col-sm-4.col-md-4.col-lg-4 img").first().attr("src");
		if (!cover) {
			cover = doc.select(".book_avatar img, .entry img, .item-thumb img").first().attr("src");
		}
		if (!cover) {
			cover = doc.select('meta[property="og:image"]').attr('content');
		}
		if (cover && cover.startsWith("//")) {
			cover = "https:" + cover;
		}
		// Lấy tên sách/truyện
		let name = doc.select("h1.tblue.fs-20").first().text();
		if (!name) {
			name = doc.select("h1[itemprop=name], h1.entry-title, .book_name").first().text();
		}
		if (!name) {
			name = doc.select('meta[property="og:title"]').attr("content");
		}
		// Lấy tác giả
		let author = doc.select("div.mg-t-10:contains(Tác giả:)").first().text();
		if (author) {
			author = author.replace("Tác giả:", "").trim();
		}
		if (!author) {
			author = doc.select("div:contains(Tác giả:)").first().text();
			if (author) {
				author = author.replace("Tác giả:", "").trim();
			}
		}
		if (!author) {
			author = doc.select(".author, .org, .book_author").first().text();
		}
		if (!author) {
			author = doc.select('meta[property="article:author"]').attr("content");
		}
		if (!author) author = "Đang cập nhật";
		// Lấy mô tả
		let description = doc.select(".gioi_thieu_sach.text-justify").first().html();
		if (!description) {
			description = doc.select(".story-detail-info, .item-desc, .detail-content, .entry-content").first().html();
		}
		if (!description) {
			description = doc.select('meta[name="description"]').attr("content");
			if (!description) {
				description = doc.select('meta[property="og:description"]').attr("content");
			}
		}
		// Kiểm tra trạng thái
		let ongoing = false;
		let statusText = doc.select(".book_info .txt, .status, .entry-status").first().text();
		if (statusText && statusText.indexOf("Đang Cập Nhật") >= 0) ongoing = true;
		
		// Lấy các link download
		let downloadLinks = [];
		
		// Lấy link PDF
		let pdfLink = doc.select('a.button.pdf').first();
		if (pdfLink) {
			downloadLinks.push("PDF: " + pdfLink.attr("href"));
		}
		
		// Lấy link EPUB
		let epubLink = doc.select('a.button.epub').first();
		if (epubLink) {
			downloadLinks.push("EPUB: " + epubLink.attr("href"));
		}
		
		// Lấy link MOBI
		let mobiLink = doc.select('a.button.mobi').first();
		if (mobiLink) {
			downloadLinks.push("MOBI: " + mobiLink.attr("href"));
		}
		
		let detail = downloadLinks.length > 0 ? downloadLinks.join("\n") : "";

		return Response.success({
			name: name,
			cover: cover,
			host: BASE_URL,
			author: author,
			description: description,
			detail: detail,
			ongoing: ongoing,
		});
	}
	return null;
}
