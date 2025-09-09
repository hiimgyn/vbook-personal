load('config.js');
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(url);

    if (response.ok) {
        let doc = response.html();
        
        // Lấy comicId và token từ script
        let comicId, token;
        try {
            comicId = /gOpts\.comicId\s*=\s*['"]?(\d+)['"]?/.exec(doc.html())[1];
        } catch (e) {
            try {
                comicId = /gOpts.comicId=(.*?);/.exec(doc.html())[1];
            } catch (e2) {
                comicId = "";
            }
        }

        if (comicId) {
            // Gọi API để lấy danh sách chương
            let apiUrl = BASE_URL + "/Comic/Services/ComicService.asmx/ChapterList?comicId=" + comicId + "&slug=" + url.split("/").pop();
            let apiResponse = fetch(apiUrl);
            
            if (apiResponse.ok) {
                let json = apiResponse.json();
                let chapters = [];
                
                if (json.data && Array.isArray(json.data)) {
                    json.data.forEach(chapter => {
                        chapters.push({
                            name: chapter.chapter_name,
                            url: BASE_URL + "/truyen-tranh/" + url.split("/").pop() + "/" + chapter.chapter_slug + "/" + chapter.chapter_id,
                            host: BASE_URL
                        });
                    });
                }
                
                return Response.success(chapters);
            }
        }
        
        // Fallback: Parse HTML trực tiếp nếu API không hoạt động
        let el = doc.select("div.list-chapter li.row .chapter a");
        const data = [];
        for (let i = el.size() - 1; i >= 0; i--) {
            let e = el.get(i);
            data.push({
                name: e.text(),
                url: e.attr("href"),
                host: BASE_URL
            });
        }
        return Response.success(data);
    }

    return null;
}