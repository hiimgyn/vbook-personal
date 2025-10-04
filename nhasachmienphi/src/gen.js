const BASE_URL = 'https://nhasachmienphi.com';

function execute(url, page) {
    if (!page) page = "0";
    let targetUrl = url;
    if (page !== "0") {
        targetUrl = url + "?start=" + page;
    }

    let response = fetch(targetUrl);
    if (response.ok) {
        let doc = response.html();
        let data = [];
        doc.select(".item_sach").forEach(e => {
            let cover = e.select("img.medium_thum").attr("src");
            if (cover && cover.startsWith("//")) {
                cover = "https:" + cover;
            }
            
            let nameElement = e.select("a.title_sach");
            let name = nameElement.text();
            let link = nameElement.attr("href");
            
            data.push({
                name: name,
                link: link,
                description: "",
                cover: cover,
                host: BASE_URL
            });
        });

        // Xử lý phân trang tiếp theo
        let next = "0";
        let nextHref = doc.select(".pagination-next, .page_redirect a:has(p.active) + a").attr("href");
        if (nextHref) {
            let match = /\?start=(\d+)/.exec(nextHref);
            if (match) next = match[1];
        }

        return Response.success(data, next);
    }
    return null;
}