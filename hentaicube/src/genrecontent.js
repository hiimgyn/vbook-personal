load("config.js");

function execute(url, page) {
    var fetchUrl = buildPagedUrl("theloai/" + url, page);

    var doc = fetchDocument(fetchUrl, FETCH_OPTIONS);
    if (!doc) return Response.success([], null);

    var items = parseListItems(doc);

    var next = items.length > 0 ? String(p + 1) : null;
    return Response.success(items, next);
}
