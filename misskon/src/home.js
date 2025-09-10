function execute() {
    return Response.success([
        {title: "Latest", input: "/", script: "updates.js"},
        {title: "Top 3 days", input: "/top3", script: "updates.js"},
        {title: "Top 7 days", input: "/top7", script: "updates.js"},
        {title: "Top 30 days", input: "/top30", script: "updates.js"},
        {title: "Top 60 days", input: "/top30", script: "updates.js"},
    ]);
}