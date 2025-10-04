load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        
        // Target the specific content container for nhasachmienphi
        let content = doc.select('.content_p.fs-16.content_p_al');
        
        if (content.size() > 0) {
            let contentElement = content.get(0);
            
            // Check if this is a manga chapter (contains img.truyen-tranh)
            let images = contentElement.select('img.truyen-tranh');
            if (images.size() > 0) {
                // This is a manga chapter - extract images
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
                // This is a text-based chapter (novel/story) - extract text content
                let paragraphs = contentElement.select('p');
                let textContent = '';
                
                for (let i = 0; i < paragraphs.size(); i++) {
                    let p = paragraphs.get(i);
                    let pText = p.text().trim();
                    if (pText && pText.length > 0) {
                        // Skip promotional text
                        if (pText.indexOf('TruyệnFULL.vn') === -1 && 
                            pText.indexOf('sachvui.com') === -1) {
                            textContent += pText + '\n\n';
                        }
                    }
                }
                
                if (textContent.trim().length > 0) {
                    return Response.success([{
                        content: textContent.trim()
                    }]);
                }
            }
        }
        
        return Response.error("No chapter content found");
    }
    
    return Response.error("Failed to fetch chapter: " + response.status);
}