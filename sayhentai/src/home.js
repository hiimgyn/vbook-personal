load('config.js');
function execute() {
    return Response.success([
        { title: "Cập Nhật", input: BASE_URL + "/", script: "gen.js" },
        { title: "Manhwa", input: BASE_URL + "/genre/manhwa", script: "gen.js" },
        { title: "Manga", input: BASE_URL + "/genre/manga", script: "gen.js" },
        { title: "Manhua", input: BASE_URL + "/genre/manhua", script: "gen.js" },
        { title: "Không che", input: BASE_URL + "/genre/khong-che", script: "gen.js" },
        { title: "Full", input: BASE_URL + "/completed", script: "gen.js" },
    ]);
}