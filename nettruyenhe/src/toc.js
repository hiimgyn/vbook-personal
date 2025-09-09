load('config.js');

// Cache regex patterns for better performance
const COMIC_ID_REGEX_1 = /gOpts\.comicId\s*=\s*['"]?(\d+)['"]?/;
const COMIC_ID_REGEX_2 = /gOpts\.comicId=(.*?);/;
const ID_SUFFIX_REGEX = /-\d+$/;

function execute(url) {
    // Optimize URL replacement by only doing it if needed
    if (!url.includes(BASE_URL)) {
        url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    }
    
    const response = fetch(url);
    if (!response.ok) {
        return null;
    }

    const doc = response.html();
    const htmlContent = doc.html();
    
    // Extract comicId more efficiently
    let comicId = "";
    let match = COMIC_ID_REGEX_1.exec(htmlContent);
    if (match) {
        comicId = match[1];
    } else {
        match = COMIC_ID_REGEX_2.exec(htmlContent);
        if (match) {
            comicId = match[1];
        }
    }

    if (comicId) {
        // Pre-calculate URL parts to avoid repeated split operations
        const urlSlug = url.split("/").pop();
        const apiUrl = `${BASE_URL}/Comic/Services/ComicService.asmx/ChapterList?comicId=${comicId}&slug=${urlSlug}`;
        const apiResponse = fetch(apiUrl);
        
        if (apiResponse.ok) {
            const json = apiResponse.json();
            
            if (json.data && Array.isArray(json.data)) {
                // Pre-calculate comic slug once
                const comicSlug = urlSlug.replace(ID_SUFFIX_REGEX, '');
                
                // Use map instead of forEach + push for better performance
                const chapters = json.data.map(chapter => ({
                    name: chapter.chapter_name,
                    url: `${BASE_URL}/truyen-tranh/${comicSlug}/${chapter.chapter_slug}/${chapter.chapter_id}`,
                    host: BASE_URL
                }));
                
                return Response.success(chapters);
            }
        }
    }
    
    // Fallback: Parse HTML directly if API doesn't work
    const elements = doc.select("div.list-chapter li.row .chapter a");
    const elementsSize = elements.size();
    
    // Pre-allocate array with known size for better performance
    const data = new Array(elementsSize);
    
    // Reverse iteration and direct assignment
    for (let i = elementsSize - 1; i >= 0; i--) {
        const element = elements.get(i);
        data[elementsSize - 1 - i] = {
            name: element.text(),
            url: element.attr("href"),
            host: BASE_URL
        };
    }
    
    return Response.success(data);
}