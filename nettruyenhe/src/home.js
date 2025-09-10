load('config.js');
function execute() {
    // Sử dụng working host với cache để tối ưu performance
    let workingHost = getWorkingHost();
    
    return Response.success([
        { title: "Mới cập nhật", input: workingHost + "/tim-truyen", script: "gen.js" },
        { title: "Truyện mới", input: workingHost + "/tim-truyen?status=-1&sort=15", script: "gen.js" },
        { title: "Top all", input: workingHost + "/tim-truyen?status=-1&sort=10", script: "gen.js" },
        { title: "Top tháng", input: workingHost + "/tim-truyen?status=-1&sort=11", script: "gen.js" },
        { title: "Top tuần", input: workingHost + "/tim-truyen?status=-1&sort=12", script: "gen.js" },
        { title: "Top ngày", input: workingHost + "/tim-truyen?status=-1&sort=13", script: "gen.js" },
        { title: "Theo dõi", input: workingHost + "/tim-truyen?status=-1&sort=20", script: "gen.js" },
        { title: "Bình luận", input: workingHost + "/tim-truyen?status=-1&sort=25", script: "gen.js" },
        { title: "Số Chapter", input: workingHost + "/tim-truyen?status=-1&sort=30", script: "gen.js" },
        { title: "Top Follow", input: workingHost + "/tim-truyen?status=-1&sort=19", script: "gen.js" },

    ]);
}