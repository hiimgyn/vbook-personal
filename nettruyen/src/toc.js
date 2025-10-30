load('config.js');

// Cache regex patterns for better performance
const COMIC_ID_REGEX_1 = /gOpts\.comicId\s*=\s*['"]?(\d+)['"]?/;
const COMIC_ID_REGEX_2 = /gOpts\.comicId=(.*?);/;
const ID_SUFFIX_REGEX = /-\d+$/;

function execute(url) {
    let result = fetchWithBackup(url);
    if (!result) {
        return null;
    }
    
    return executeWithResponse(result.response, url, result.currentHost);
}

function executeWithResponse(response, url, currentHost) {

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
        const apiUrl = `${currentHost}/Comic/Services/ComicService.asmx/ChapterList?comicId=${comicId}&slug=${urlSlug}`;
        const apiResult = fetchWithBackup(apiUrl);
        const apiResponse = apiResult ? apiResult.response : null;
        
        if (apiResponse.ok) {
            const json = apiResponse.json();

            if (json.data && Array.isArray(json.data)) {
                // Pre-calculate comic slug once
                const comicSlug = urlSlug.replace(ID_SUFFIX_REGEX, '');

                // Sort chapters by chapter number (ascending order - từ bé đến lớn)
                const sortedData = json.data.sort((a, b) => {
                    const aNum = parseFloat(a.chapter_name.replace(/[^\d.]/g, '')) || 0;
                    const bNum = parseFloat(b.chapter_name.replace(/[^\d.]/g, '')) || 0;
                    return aNum - bNum;
                });

                // Use map instead of forEach + push for better performance
                const chapters = sortedData.map(chapter => ({
                    name: chapter.chapter_name,
                    url: `${currentHost}/truyen-tranh/${comicSlug}/${chapter.chapter_slug}/${chapter.chapter_id}`,
                    host: currentHost
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

    // Extract chapters in reverse order (vì HTML thường list từ mới nhất)
    for (let i = 0; i < elementsSize; i++) {
        const element = elements.get(elementsSize - 1 - i);
        data[i] = {
            name: element.text(),
            url: normalizeUrl(element.attr("href"), currentHost),
            host: currentHost
        };
    }

    return Response.success(data);
}