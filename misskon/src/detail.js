load('config.js');

function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();

        let cover = doc.select(".entry p img").first().attr("data-src");
        let title = doc.select("h1.entry-title span").text();
        
        let infoBlock = doc.select(".box-inner-block");
        let infoText = infoBlock.text();
        
        let albumTitle = "";
        let albumTitleMatch = infoText.match(/Album title:\s*(.+?)(?=\n|$)/);
        if (albumTitleMatch) {
            albumTitle = albumTitleMatch[1].trim();
        }
        
        let model = "";
        let modelMatch = infoText.match(/Model:\s*([^N]+?)(?=Number of items)/);
        if (modelMatch) {
            model = modelMatch[1].trim();
        }

        let genres = [];
        let tagElements = doc.select(".post-tag a");
        tagElements.forEach(e => {
            genres.push({ 
                title: e.text(), 
                input: e.attr("href"), 
                script: "gen.js" 
            });
        });

        return Response.success({
            name: title,
            author: model,
            detail: infoBlock.html(),
            cover: cover,
            host: BASE_URL,
            genres: genres,
            suggests: [
              {
                title: "View more",
                input: doc.select(".yarpp-thumbnails-horizontal").html(),
                script: "suggest.js"
              }
            ],
        });
    }
    return null;
}
