load("bypass.js");

var BASE_URL = "https://hentaicube.xyz";
var HOST = "https://hentaicube.xyz";

var FETCH_HEADERS = {
    "Referer": BASE_URL + "/"
};
var FETCH_OPTIONS = { headers: FETCH_HEADERS };

var GENRE_SLUG_RE = /\/theloai\/([^\/?#]+)/;
var SIZE_SUFFIX_RE = /-\d+x\d+(\.[^./?]+)$/;
var QUERY_SPLIT_RE = /\?/;
var TRAILING_SLASH_RE = /\/+$/;

function selFirst(el, css) {
    var r = el.select(css);
    return r.size() > 0 ? r.get(0) : null;
}

function resolveUrl(url) {
    if (!url) return BASE_URL;
    if (url.indexOf("http") === 0) return url;
    return BASE_URL + (url.charAt(0) === "/" ? url : "/" + url);
}

function fetchDocument(url, options) {
    var opts = options || FETCH_OPTIONS;
    var res = fetch(url, opts);
    if (!res || !res.ok) return null;
    var doc = res.html();
    if (!doc) return null;

    var method = (opts && opts.method ? String(opts.method) : "GET").toUpperCase();
    if (method === "GET" && typeof bypass === "function") {
        doc = bypass(url, doc);
    }

    return doc;
}

function buildPagedUrl(pathOrUrl, page) {
    var raw = pathOrUrl || "";
    var parts = raw.split(QUERY_SPLIT_RE);
    var path = parts[0] || "";
    var query = parts.length > 1 ? parts.slice(1).join("?") : "";
    var p = page ? parseInt(page) : 1;

    path = path.replace(TRAILING_SLASH_RE, "");
    if (!path) path = "/";

    var pagedPath = p > 1 ? path + "/page/" + p : path;
    if (pagedPath.charAt(pagedPath.length - 1) !== "/") {
        pagedPath += "/";
    }

    var finalUrl = resolveUrl(pagedPath);
    return query ? finalUrl + "?" + query : finalUrl;
}
// Lấy ảnh chất lượng đầy đủ bằng cách bỏ hậu tố kích thước -NxN
function stripSizeSuffix(src) {
    if (!src) return "";
    return src.replace(SIZE_SUFFIX_RE, "$1");
}

// Parse danh sách truyện từ trang list/genre
// Trả về description là chương mới nhất
function parseListItems(doc) {
    var result = [];
    var seen = {};
    var cards = doc.select("div.page-item-detail");
    for (var i = 0; i < cards.size(); i++) {
        var card = cards.get(i);
        var titleA = selFirst(card, ".post-title h3 a, .post-title a, h3.h5 a, .item-thumb a");
        if (!titleA) continue;
        var name = titleA.text().trim();
        if (!name) name = (titleA.attr("title") || "").trim();
        var link = titleA.attr("href") || "";
        if (!link || seen[link]) continue;
        seen[link] = true;

        var imgEl = selFirst(card, ".item-thumb img");
        var cover = "";
        if (imgEl) {
            var rawCover = imgEl.attr("data-src") || imgEl.attr("data-lazy-src") || imgEl.attr("src") || "";
            cover = stripSizeSuffix(rawCover);
        }

        // Chương mới nhất hiển thị dưới mỗi truyện
        var chapA = selFirst(card, ".item-summary .btn-link, .list-chapter .chapter-item .chapter a, .chapter-item .chapter a");
        var description = chapA ? chapA.text().replace(/\s+/g, " ").trim() : "";

        result.push({ name: name, link: link, host: HOST, cover: cover, description: description });
    }
    return result;
}
