load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        
        let content = doc.select('.content_p.fs-16.content_p_al');
        
        if (content.size() > 0) {
            let contentElement = content.get(0);
            
            let images = contentElement.select('img.truyen-tranh');
            if (images.size() > 0) {
                let data = [];
                for (let i = 0; i < images.size(); i++) {
                    let img = images.get(i);
                    let src = img.attr('src');
                    if (src) {
                        data.push({
                            link: src
                        });
                    }
                }
                if (data.length > 0) {
                    return Response.success(data);
                }
            } else {
                let paragraphs = contentElement.select('p');
                let htmlContent = '';
                
                for (let i = 0; i < paragraphs.size(); i++) {
                    let p = paragraphs.get(i);
                    let pText = p.text().trim();
                    if (pText && pText.length > 0) {
                        if (pText.indexOf('TruyệnFULL.vn') === -1 && 
                            pText.indexOf('sachvui.com') === -1) {
                            htmlContent += '<p>' + pText + '</p>\n';
                        }
                    }
                }
                
                if (htmlContent.trim().length > 0) {
                    return Response.success(htmlContent.trim());
                }
            }
        }
        
        return Response.error("No chapter content found");
    }
    
    return Response.error("Failed to fetch chapter: " + response.status);
}