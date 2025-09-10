load('config.js');

function execute(input, next) {
    if (!next) next = "1";
    let result = fetchWithBackup(input + "&pageNumber=" + next);
    if (!result) {
        return null;
    }
    
    let response = result.response;
    if (response.ok) {
        let json = response.json();
        let doc = Html.parse(json.response);
        let comments = [];
        doc.select(".summary").forEach(function(e) {
            comments.push({
                name: e.select(".authorname").text(),
                content: e.select(".comment-content").text(),
                description: e.select(".comment-footer abbr").first().text()
            });
        });

        let pager = Html.parse(json.pager);
        let nextPage = pager.select("li.active + li").text();

        return Response.success(comments, nextPage);
    }

    return null;
}