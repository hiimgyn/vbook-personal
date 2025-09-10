let BASE_URL = 'https://www.nettruyenhe.com';
let BACKUP_URLS = [
    'https://nettruyenvia.com'
];

// Tất cả URLs có thể sử dụng (bao gồm BASE_URL)
let ALL_HOSTS = [BASE_URL].concat(BACKUP_URLS);

try {
    if (CONFIG_URL) {
        BASE_URL = CONFIG_URL;
        // Cập nhật lại ALL_HOSTS nếu có CONFIG_URL
        ALL_HOSTS = [BASE_URL].concat(BACKUP_URLS);
    }
} catch (error) {
}

/**
 * Xử lý cơ chế backup URL cho NetTruyenHE với nhiều địa chỉ backup
 * @param {string} url - URL gốc cần fetch
 * @param {Object} options - Tùy chọn bổ sung (optional)
 * @returns {Object} - Object chứa response và currentHost
 */
function fetchWithBackup(url, options) {
    if (!options) options = {};
    
    // Xác định host hiện tại và chuẩn hóa URL
    let currentHost = BASE_URL;
    let urlsToTry = [];
    
    // Nếu URL không chứa bất kỳ host nào đã biết, chuẩn hóa với BASE_URL
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
    
    // Tạo danh sách các URL để thử theo thứ tự ưu tiên
    urlsToTry.push(url); // URL hiện tại đầu tiên
    
    // Thêm các backup URLs
    if (currentHost === BASE_URL) {
        // Nếu đang dùng BASE_URL, thử các backup
        for (let i = 0; i < BACKUP_URLS.length; i++) {
            let backupUrl = BACKUP_URLS[i];
            urlsToTry.push(url.replace(BASE_URL, backupUrl));
        }
    } else {
        // Nếu đang dùng backup, thử BASE_URL và các backup khác
        urlsToTry.push(url.replace(currentHost, BASE_URL));
        for (let i = 0; i < BACKUP_URLS.length; i++) {
            let backupUrl = BACKUP_URLS[i];
            if (backupUrl !== currentHost) {
                urlsToTry.push(url.replace(currentHost, backupUrl));
            }
        }
    }
    
    // Thử từng URL cho đến khi có kết quả
    for (let i = 0; i < urlsToTry.length; i++) {
        let tryUrl = urlsToTry[i];
        let response = fetch(tryUrl, options);
        
        if (response.ok) {
            // Xác định host đang được sử dụng
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

/**
 * Chuyển đổi URL tương đối thành URL tuyệt đối với host hiện tại
 * @param {string} url - URL cần chuyển đổi
 * @param {string} currentHost - Host hiện tại
 * @returns {string} - URL tuyệt đối
 */
function normalizeUrl(url, currentHost) {
    if (!url) return url;
    if (url.startsWith('http')) return url;
    return currentHost + (url.startsWith('/') ? url : '/' + url);
}

/**
 * Lấy danh sách tất cả các URL backup từ URL chính
 * @param {string} url - URL chính
 * @returns {Array} - Mảng các URL backup
 */
function getAllBackupUrls(url) {
    let backupUrls = [];
    
    if (url.includes(BASE_URL)) {
        for (let i = 0; i < BACKUP_URLS.length; i++) {
            let backupUrl = BACKUP_URLS[i];
            backupUrls.push(url.replace(BASE_URL, backupUrl));
        }
    } else {
        // Thêm BASE_URL
        for (let i = 0; i < BACKUP_URLS.length; i++) {
            let backupUrl = BACKUP_URLS[i];
            if (url.includes(backupUrl)) {
                backupUrls.push(url.replace(backupUrl, BASE_URL));
                // Thêm các backup khác
                for (let j = 0; j < BACKUP_URLS.length; j++) {
                    let otherBackup = BACKUP_URLS[j];
                    if (otherBackup !== backupUrl) {
                        backupUrls.push(url.replace(backupUrl, otherBackup));
                    }
                }
                break;
            }
        }
    }
    
    return backupUrls;
}

/**
 * Lấy host hiện tại từ URL
 * @param {string} url - URL cần kiểm tra
 * @returns {string} - Host hiện tại
 */
function getCurrentHost(url) {
    if (url.includes(BASE_URL)) {
        return BASE_URL;
    }
    
    for (let i = 0; i < BACKUP_URLS.length; i++) {
        let backupUrl = BACKUP_URLS[i];
        if (url.includes(backupUrl)) {
            return backupUrl;
        }
    }
    
    return BASE_URL; // Default
}

// Cache cho working host để tránh test nhiều lần
let _cachedWorkingHost = null;
let _cacheTimestamp = 0;
let CACHE_DURATION = 5 * 60 * 1000; // 5 phút

/**
 * Lấy host đang hoạt động với caching
 * @returns {string} - Working host
 */
function getWorkingHost() {
    let now = Date.now();
    
    // Nếu cache còn hiệu lực, trả về cache
    if (_cachedWorkingHost && (now - _cacheTimestamp) < CACHE_DURATION) {
        return _cachedWorkingHost;
    }
    
    // Test BASE_URL trước
    let testUrl = BASE_URL + "/tim-truyen";
    let result = fetchWithBackup(testUrl);
    
    if (result && result.currentHost) {
        _cachedWorkingHost = result.currentHost;
        _cacheTimestamp = now;
        return _cachedWorkingHost;
    }
    
    // Fallback về BASE_URL nếu không có gì hoạt động
    _cachedWorkingHost = BASE_URL;
    _cacheTimestamp = now;
    return _cachedWorkingHost;
}

/**
 * Xóa cache working host (dùng khi cần force refresh)
 */
function clearWorkingHostCache() {
    _cachedWorkingHost = null;
    _cacheTimestamp = 0;
}

/**
 * Thiết lập host ưu tiên thủ công
 * @param {string} host - Host muốn sử dụng
 */
function setPreferredHost(host) {
    if (ALL_HOSTS.includes(host)) {
        _cachedWorkingHost = host;
        _cacheTimestamp = Date.now();
        return true;
    }
    return false;
}

/**
 * Lấy danh sách tất cả hosts có thể sử dụng
 * @returns {Array} - Mảng tất cả hosts
 */
function getAllHosts() {
    return ALL_HOSTS.slice(); // Return copy
}

/**
 * Kiểm tra host có khả dụng không
 * @param {string} host - Host cần kiểm tra
 * @returns {boolean} - True nếu host khả dụng
 */
function isHostAvailable(host) {
    try {
        let testUrl = host + "/tim-truyen";
        let response = fetch(testUrl);
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Để tương thích ngược
let BACKUP_URL = BACKUP_URLS[0];