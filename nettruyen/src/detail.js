load('config.js');

function execute(url) {
    let result = fetchWithBackup(url);
    if (!result) {
        return null;
    }
    
    let response = result.response;
    let currentHost = result.currentHost;

    if (response.ok) {
        let doc = response.html();

        // Lấy ảnh bìa từ .col-image img
        let coverImg = doc.select(".col-image img").first().attr("src");
        if (!coverImg) {
            coverImg = doc.select(".detail-info img").first().attr("src");
        }
        if (coverImg && coverImg.startsWith("//")) {
            coverImg = "https:" + coverImg;
        }

        // Lấy thể loại từ .kind .col-xs-8 a
        let genres = [];
        const genreElements = doc.select(".kind .col-xs-8 a"); // Lấy tất cả các phần tử một lần
        for (let i = 0; i < genreElements.size(); i++) {
            const e = genreElements.get(i);
            genres.push({
                title: e.text(),
                input: normalizeUrl(e.attr("href"), currentHost),
                script: "gen.js"
            });
        }

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

        try {
            token = /window\.token\s*=\s*['"]([^'"]+)['"]/.exec(doc.html())[1];
        } catch (e) {
            try {
                token = /gOpts.key=.(.*?).;/.exec(doc.html())[1];
            } catch (e2) {
                token = "";
            }
        }

        // Lấy thông tin chi tiết và lượt xem
        let detail = doc.select("time.small").first().text();
        let viewElements = doc.select(".list-info li");
        viewElements.forEach(function(element) {
            let nameText = element.select(".name").text();
            if (nameText && nameText.indexOf("Lượt xem") >= 0) {
                let viewCount = element.select(".col-xs-8").text();
                if (viewCount) {
                    detail += "<br>Lượt xem: " + viewCount;
                }
            }
        });

        // Lấy tác giả từ li.author .col-xs-8
        let author = doc.select(".author .col-xs-8").first().text();
        if (!author) {
            author = "Đang cập nhật";
        }

        // Lấy mô tả từ .detail-content .shortened, chỉ lấy "Tóm tắt nội dung truyện"
        let description = "";
        const descriptionElement = doc.select(".detail-content .shortened").first();
        if (descriptionElement) {
            const paragraphs = descriptionElement.select("p");
            for (let i = 0; i < paragraphs.size(); i++) {
                const paragraph = paragraphs.get(i);
                if (paragraph.text().includes("Tóm tắt nội dung truyện")) {
                    description = paragraph.text();
                    break;
                }
            }
        }

        // Kiểm tra trạng thái từ li.status .col-xs-8
        let statusText = doc.select(".status .col-xs-8").first().text();
        let ongoing = statusText && statusText.indexOf("Đang tiến hành") >= 0;

        return Response.success({
            name: doc.select("h1.title-detail").first().text(),
            cover: coverImg,
            author: author || "Đang cập nhật",
            description: description || "",
            detail: detail,
            ongoing: ongoing,
            genres: genres,
            comments: [{
                title: "Bình luận",
                input: currentHost + "/Comic/Services/CommentService.asmx/List?comicId=" + comicId + "&orderBy=0&chapterId=-1&parentId=0&token=" + token,
                script: "comment.js"
            }],
            host: currentHost
        });
    }

    return null;
}