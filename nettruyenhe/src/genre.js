load('config.js');

function execute() {
    let result = fetchWithBackup(BASE_URL + "/tim-truyen");
    if (!result) {
        return null;
    }
    
    let response = result.response;
    let currentHost = result.currentHost;
    
    if (response.ok) {
        let doc = response.html();
        let genres = [];
        doc.select(".dropdown-genres option").forEach(function(e) {
            genres.push({
                title: e.text(),
                input: normalizeUrl(e.attr("value"), currentHost),
                script: "gen.js"
            })
        });
        return Response.success(genres);
    }

    return null;
}