load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(url);
    if (response.ok) {
      let doc = response.html();
      let pages = doc.select(".entry .page-link").first().select("a");
      let list = [
        {
          name: 'Page 1',
          url: url,
          host: BASE_URL
        }
      ];
      pages.forEach(e => {
        list.push({
            name: 'Page ' +e.text(),
            url: e.attr("href"),
            host: BASE_URL
        });
      });
      return Response.success(list);
    }
    return null;
}