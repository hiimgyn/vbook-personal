load('config.js');
function execute(url, page) {
    if (!page) page = '1';

    let baseUrl = url.endsWith("/") ? url.slice(0, -1) : url;
    let response = fetch(baseUrl + "/trang-" + page);

    if (!response.ok) return null;

    let doc = response.html();
    let novelList = [];
    let next = null;

    let nextEl = doc.select(".pagination > li.active + li > a").first();
    if (nextEl) {
        let nextText = nextEl.text();
        if (nextText) next = nextText.trim();
    }

    doc.select(".list-truyen .row[itemscope]").forEach(e => {
        let titleEl = e.select(".truyen-title > a").first();
        let name = titleEl ? titleEl.text() : "";
        let link = titleEl ? titleEl.attr("href") : "";
        if (!name || !link) return;

        let cover = "";
        let img = e.select("img.cover").first();
        if (img) {
            cover = img.attr("src") || "";
        } else {
            let lazy = e.select(".lazyimg").first();
            if (lazy) cover = lazy.attr("data-image") || "";
        }

        let author = e.select(".author").first();
        let authorText = author ? author.text().trim() : "";
        let chapterCount = e.select(".author").last();
        let chapterText = chapterCount ? chapterCount.text().trim() : "";

        let description = authorText;
        if (chapterText && chapterText !== authorText) {
            description = authorText ? authorText + " | " + chapterText : chapterText;
        }

        novelList.push({
            name: name,
            link: link,
            description: description,
            cover: cover,
            host: BASE_URL,
        });
    });

    return Response.success(novelList, next);
}