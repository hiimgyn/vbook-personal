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

const dns = require('dns');
const cloudflareResolver = new dns.Resolver();
cloudflareResolver.setServers(['1.1.1.1']);
const googleResolver = new dns.Resolver();
googleResolver.setServers(['8.8.8.8']);

async function resolveDomain(domain) {
    try {
        const addresses = await cloudflareResolver.resolve4(domain);
        return addresses[0];
    } catch (err) {
        try {
            const addresses = await googleResolver.resolve4(domain);
            return addresses[0];
        } catch (err2) {
            throw new Error('Không thể phân giải tên miền với Cloudflare hoặc Google DNS');
        }
    }
}

// Custom fetch sử dụng DNS resolver
async function customFetch(url, options = {}) {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const ip = await resolveDomain(domain);
    urlObj.hostname = ip;
    options.headers = options.headers || {};
    options.headers['Host'] = domain;
    const fetch = require('node-fetch');
    return await fetch(urlObj.toString(), options);
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