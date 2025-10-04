let BASE_URL = 'https://nhasachmienphi.com';
try {
    if (CONFIG_URL) {
        BASE_URL = CONFIG_URL;
    }
} catch (error) {
}