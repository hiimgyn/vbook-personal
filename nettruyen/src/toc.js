load('config.js');

const COMIC_ID_REGEX_1 = /gOpts\.comicId\s*=\s*['"]?(\d+)['"]?/;
const COMIC_ID_REGEX_2 = /gOpts\.comicId=(.*?);/;
const ID_SUFFIX_REGEX = /-\d+$/;
const CHAPTER_NUM_REGEX = /[^\d.]/g;

const CHAPTER_SELECTOR = "div.list-chapter li.row .chapter a";

function execute(url) {
    let result = fetchWithBackup(url);
    if (!result) {
        return null;
    }
    
    return executeWithResponse(result.response, url, result.currentHost);
}

function executeWithResponse(response, url, currentHost) {
    if (!response.ok) {
        return null;
    }

    const doc = response.html();
    const htmlContent = doc.html();

    let match = COMIC_ID_REGEX_1.exec(htmlContent);
    if (!match) {
        match = COMIC_ID_REGEX_2.exec(htmlContent);
    }
    const comicId = match ? match[1] : "";

    if (comicId) {
        const lastSlashIdx = url.lastIndexOf('/');
        const urlSlug = url.substring(lastSlashIdx + 1);
        const apiUrl = `${currentHost}/Comic/Services/ComicService.asmx/ChapterList?comicId=${comicId}&slug=${urlSlug}`;
        const apiResult = fetchWithBackup(apiUrl);

        if (apiResult && apiResult.response.ok) {
            const json = apiResult.response.json();

            if (json.data && json.data.length > 0) {
                const comicSlug = urlSlug.replace(ID_SUFFIX_REGEX, '');
                const baseChapterUrl = `${currentHost}/truyen-tranh/${comicSlug}/`;

                const chapters = parallelSortAndMap(json.data, chapter => {
                    const chapterNum = parseFloat(chapter.chapter_name.replace(CHAPTER_NUM_REGEX, '')) || 0;
                    return {
                        name: chapter.chapter_name,
                        url: `${baseChapterUrl}${chapter.chapter_slug}/${chapter.chapter_id}`,
                        host: currentHost,
                        chapterNum
                    };
                });

                return Response.success(chapters);
            }
        }
    }

    const elements = doc.select(CHAPTER_SELECTOR);
    const elementsSize = elements.size();
    
    if (elementsSize === 0) {
        return Response.success([]);
    }

    const data = new Array(elementsSize);

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

function parallelSortAndMap(data, mapFn) {
    const mappedData = data.map(mapFn);
    return mappedData.sort((a, b) => a.chapterNum - b.chapterNum);
}