function enhancedBypass(url, doc) {
    var cookieMatch = doc.html().match(/document\.cookie="(.*?)"/);
    var cookies = cookieMatch ? cookieMatch[1] : "";

    var baseUrl = url.match(/^https?:\/\/[^\/]+/);
    var referer = baseUrl ? baseUrl[0] + "/" : url;

    doc = Http.get(url)
        .headers({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Referer": referer,
            "Cookie": cookies
        })
        .html();

    doc.select("script").forEach(function(script) {
        script.remove();
    });

    return doc;
}