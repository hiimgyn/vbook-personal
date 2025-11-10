let BASE_URL = 'https://nettruyenviet1.com';
let BACKUP_URLS = [
    'https://nettruyenhe.com'
];

let ALL_HOSTS = [BASE_URL].concat(BACKUP_URLS);

try {
    if (CONFIG_URL) {
        BASE_URL = CONFIG_URL;
        ALL_HOSTS = [BASE_URL].concat(BACKUP_URLS);
    }
} catch (error) {
}

function fetchWithBackup(url, options) {
    if (!options) options = {};
    
    let currentHost = BASE_URL;
    let urlsToTry = [];
    
    let isKnownHost = false;
    if (url.includes(BASE_URL)) {
        currentHost = BASE_URL;
        isKnownHost = true;
    } else {
        for (let i = 0; i < BACKUP_URLS.length; i++) {
            let backupUrl = BACKUP_URLS[i];
            if (url.includes(backupUrl)) {
                currentHost = backupUrl;
                isKnownHost = true;
                break;
            }
        }
    }
    
    if (!isKnownHost) {
        url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
        currentHost = BASE_URL;
    }
    
    urlsToTry.push(url); 
    
    if (currentHost === BASE_URL) {
        for (let i = 0; i < BACKUP_URLS.length; i++) {
            let backupUrl = BACKUP_URLS[i];
            urlsToTry.push(url.replace(BASE_URL, backupUrl));
        }
    } else {
        urlsToTry.push(url.replace(currentHost, BASE_URL));
        for (let i = 0; i < BACKUP_URLS.length; i++) {
            let backupUrl = BACKUP_URLS[i];
            if (backupUrl !== currentHost) {
                urlsToTry.push(url.replace(currentHost, backupUrl));
            }
        }
    }
    
    for (let i = 0; i < urlsToTry.length; i++) {
        let tryUrl = urlsToTry[i];
        let response = fetch(tryUrl, options);
        
        if (response.ok) {
            let workingHost = BASE_URL;
            if (tryUrl.includes(BASE_URL)) {
                workingHost = BASE_URL;
            } else {
                for (let j = 0; j < BACKUP_URLS.length; j++) {
                    let backupUrl = BACKUP_URLS[j];
                    if (tryUrl.includes(backupUrl)) {
                        workingHost = backupUrl;
                        break;
                    }
                }
            }
            
            return {
                response: response,
                currentHost: workingHost
            };
        }
    }
    
    return null;
}

function normalizeUrl(url, currentHost) {
    if (!url) return url;
    
    if (url.startsWith('http')) {
        return url
            .replace(/https?:\/\/(?:www\.)?nettruyenviet1\.com/, BASE_URL)
            .replace(/https?:\/\/(?:www\.)?nettruyenhe\.com/, BASE_URL);
    }
    
    return BASE_URL + (url.startsWith('/') ? url : '/' + url);
}

let _cachedWorkingHost = null;
let _cacheTimestamp = 0;
let CACHE_DURATION = 5 * 60 * 1000; 

function getWorkingHost() {
    let now = Date.now();
    
    if (_cachedWorkingHost && (now - _cacheTimestamp) < CACHE_DURATION) {
        return _cachedWorkingHost;
    }
    
    let testUrl = BASE_URL + "/tim-truyen";
    let result = fetchWithBackup(testUrl);
    
    if (result && result.currentHost) {
        _cachedWorkingHost = result.currentHost;
        _cacheTimestamp = now;
        return _cachedWorkingHost;
    }
    
    _cachedWorkingHost = BASE_URL;
    _cacheTimestamp = now;
    return _cachedWorkingHost;
}



let BACKUP_URL = BACKUP_URLS[0];