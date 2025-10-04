load('config.js');

function execute(key, page) {
    page = page || 1;
    
    // Build search URL - nhasachmienphi uses ?s= parameter for search
    let url = BASE_URL + '/?s=' + encodeURIComponent(key);
    if (page > 1) {
        url += '&paged=' + page;
    }
    
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        let data = [];
        
        // Extract search results from .item_sach containers
        let items = doc.select('.item_sach');
        
        for (let i = 0; i < items.size(); i++) {
            let item = items.get(i);
            
            // Extract title link
            let titleLink = item.select('a.title_sach').first();
            if (titleLink) {
                let title = titleLink.text().trim();
                let link = titleLink.attr('href');
                
                // Extract thumbnail image
                let img = item.select('img.medium_thum').first();
                let cover = '';
                if (img) {
                    cover = img.attr('src');
                    // Ensure absolute URL for cover
                    if (cover && cover.startsWith('/')) {
                        cover = BASE_URL + cover;
                    }
                }
                
                if (title && link) {
                    data.push({
                        name: title,
                        link: link,
                        cover: cover,
                        description: '',
                        host: BASE_URL
                    });
                }
            }
        }
        
        return Response.success(data);
    }
    
    return Response.error("Failed to fetch search results: " + response.status);
}