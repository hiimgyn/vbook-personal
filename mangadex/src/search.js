load("config.js");

function execute(key, page) {
    if (!page) page = 0;
    var response = fetch(API_URL + "/manga?title=" + key + "&limit=20&offset=" + page + "&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&includes[]=cover_art&order[relevance]=desc");
    if (response.ok) {
        var data = response.json();
        var books = [];
        var next = "";
        if (data.offset + data.limit < data.total) {
            next = data.offset + data.limit;
        }
        data.data.forEach(function(item) {
            var bookId = item.id;
            var relationships = item.relationships;
            var cover = null;
            for (var i = 0; i < relationships.length; i++) {
                if (relationships[i].type === "cover_art") {
                    cover = BASE_URL + "/covers/" + bookId + "/" + relationships[i].attributes.fileName + ".256.jpg";
                    break;
                }
            }
            books.push({
                name: getDisplayLanguageData(item.attributes.title),
                link: BASE_URL + "/title/" + bookId,
                cover: cover,
                host: BASE_URL
            });
        });
        return Response.success(books, next + "");
    }
    return null;
}