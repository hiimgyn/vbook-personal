load('config.js');
function execute(input, next) {
    let doc = Html.parse(input);
    let data = [];
    doc.select("a").forEach(e => {
        data.push({
            name: e.attr("title"),
            link: e.attr("href"),
            cover: e.select("img").first().attr("data-src"),
            host: BASE_URL
        })
    });
    return Response.success(data);
}