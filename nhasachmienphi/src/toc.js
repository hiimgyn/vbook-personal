load('config.js');

function execute(url) {
	// Normalize URL to use BASE_URL
	url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
	
	let response = fetch(url);
	if (response.ok) {
		let doc = response.html();
		let chapterNodes = doc.select('.item_ch_mora .item_ch a');
		let chapters = [];
		for (let i = 0; i < chapterNodes.size(); i++) {
			let a = chapterNodes.get(i);
			chapters.push({
				name: a.text().trim(),
				url: a.attr('href'),
				host: BASE_URL
			});
		}
		return Response.success(chapters);
	}
	return null;
}
