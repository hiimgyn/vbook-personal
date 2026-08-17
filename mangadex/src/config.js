let BASE_URL = 'https://mangadex.org';
let LANGUAGE = "vi,en,ja-ro,ja";
let FALLBACK_LANGUAGE = "en,ja-ro,ja"
try {
    if (CONFIG_URL) {
        BASE_URL = CONFIG_URL;
    }
    if (CONFIG_LANGUAGE) {
        LANGUAGE = CONFIG_LANGUAGE;
    }
} catch (error) {
}
let API_URL = BASE_URL.replace("https://", "https://api.");

function sleep(ms) {
    let start = Date.now();
    while (Date.now() - start < ms) {}
}

function fetchWithRetry(url, retries) {
    if (!retries) retries = 3;
    for (let i = 0; i < retries; i++) {
        try {
            let response = fetch(url);
            if (response && response.ok) return response;
        } catch (e) {}
        if (i < retries - 1) sleep(1000 * (i + 1));
    }
    return null;
}

function getDisplayLanguageData(value) {
    let lang = LANGUAGE.split(",");
    if (lang.length === 0) lang = ["vi"];
    for (let i = 0; i < lang.length; i++) {
        if (value[lang[i]]) return value[lang[i]];
    }
    lang = FALLBACK_LANGUAGE.split(",");
    for (let i = 0; i < lang.length; i++) {
        if (value[lang[i]]) return value[lang[i]];
    }
    const firstKey = Object.keys(value)[0];
    return value[firstKey];
}