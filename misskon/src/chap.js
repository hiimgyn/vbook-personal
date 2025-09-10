load("config.js");
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(url);
    if (response.ok) {
        let data = []
        let doc = response.html();
        let imgs = doc.select(".entry p img");

        imgs.forEach(e => {
          data.push(e.attr("data-src"));
        })

        return Response.success(data);
    }
    return null;
}