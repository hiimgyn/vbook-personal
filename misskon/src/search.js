load("config.js");
function execute(key, page) {
    if (!page) page = '1';
    let response = fetch(BASE_URL + `/page/${page}/?s=${key}`);
    if (response.ok) {
      let doc = response.html();
      const data = [];
      doc.select("article.item-list").forEach(e => {
          let nameElement = e.select(".post-box-title a").first();
          let catElement = e.select(".post-cats a");
          let viewElement = e.select(".post-views").first();
          let thumbElement = e.select(".post-thumbnail a img").first();
          let link = nameElement.attr("href");
          let cover = thumbElement.attr("data-src");

          let desc = 'Category: '
          catElement.forEach(e => {
            desc += e.text() + ', ';
          });
          desc = desc.slice(0, -2);
          desc += ' | Views: ' + viewElement.text();

          data.push({
            name: nameElement.text(),
            link: link,
            description: desc,
            cover: cover,
            host: BASE_URL
          });
        });
          
      return Response.success(data);
    }
    return null;
}
