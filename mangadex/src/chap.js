load("config.js");

function execute(url) {
    let chapterId = /chapter\/(.*?)$/g.exec(url)[1];
    return customFetch(API_URL + "/at-home/server/" + chapterId + "?forcePort443=false")
        .then(async response => {
            if (response.ok) {
                let data = await response.json();
                let images = [];
                data.chapter.data.forEach((chapter) => {
                    images.push(data.baseUrl + "/data/" + data.chapter.hash + "/" + chapter)
                });
                return Response.success(images);
            }
            return null;
        });
}