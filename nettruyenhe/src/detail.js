load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        
        // Lấy ảnh bìa từ .col-image img (cấu trúc: .col-xs-4.col-image img)
        let coverImg = doc.select(".col-image img").first().attr("src");
        if (!coverImg) {
            coverImg = doc.select(".detail-info img").first().attr("src");
        }
        if (coverImg && coverImg.startsWith("//")) {
            coverImg = "https:" + coverImg;
        }
        
        // Lấy thể loại từ .kind .col-xs-8 a (cấu trúc: li.kind > p.col-xs-8 > a)
        let genres = [];
        doc.select(".kind .col-xs-8 a").forEach(e => {
            genres.push({
                title: e.text(),
                input: e.attr("href"),
                script: "gen.js"
            });
        });

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
        
        // Tìm li chứa "Lượt xem" và lấy số liệu
        let viewElements = doc.select(".list-info li");
        for (let i = 0; i < viewElements.length; i++) {
            let nameText = doc.select(viewElements[i]).select(".name").text();
            if (nameText && nameText.indexOf("Lượt xem") >= 0) {
                let viewCount = doc.select(viewElements[i]).select(".col-xs-8").text();
                if (viewCount) {
                    detail += "<br>Lượt xem: " + viewCount;
                }
                break;
            }
        }

        // Lấy tác giả từ li.author .col-xs-8
        let author = doc.select(".author .col-xs-8").first().text();
        if (!author) {
            author = "Đang cập nhật";
        }
        
        // Lấy mô tả từ .detail-content .shortened
        let description = doc.select(".detail-content .shortened").html();
        if (!description) {
            description = doc.select(".detail-content p").html();
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
            comment: {
                input: BASE_URL + "/Comic/Services/CommentService.asmx/List?comicId=" + comicId + "&orderBy=0&chapterId=-1&parentId=0&token=" + token,
                script: "comment.js"
            },
            host: BASE_URL
        });
    }

    return null;
}