load('config.js');

let DEFAULT_COVER = "https://placehold.co/300x400/EEE/31343C"

function execute(url, page) {
  let full_url = page ? BASE_URL + url + "page/" + page : BASE_URL + url;
  let response = fetch(full_url);

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

    if (url == '/' && !page) page = 1
    let next = page ? parseInt(page, 10) + 1 : null
    if (next) next = next.toString()
        
    return Response.success(data, next);
  }
  return null;
}
