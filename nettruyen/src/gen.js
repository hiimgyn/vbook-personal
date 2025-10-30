load('config.js');
function execute(url, page) {
    if (!page) page = '1';
    let result = fetchWithBackup(url, {
        method: "GET",
        queries: {
            page: page
        }
    });
    if (!result) {
        return null;
    }
    
    let response = result.response;
    let currentHost = result.currentHost;
    
    if (response.ok) {
        let doc = response.html();

        let next = doc.select(".pagination").select("li.active + li").text();
        let data = [];
        doc.select(".items .item").forEach(function(e) {
            let coverImg = e.select(".image img").first().attr("data-original");
            if (coverImg.startsWith("//")) {
                coverImg = "https:" + coverImg;
            }
            data.push({
                name: e.select("h3 a").first().text(),
                link: normalizeUrl(e.select("h3 a").first().attr("href"), currentHost),
                cover: coverImg,
                description: e.select(".chapter a").first().text(),
                host: currentHost
            });
        });

        return Response.success(data, next);
    }

    return null;
}