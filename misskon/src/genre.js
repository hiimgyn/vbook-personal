load("config.js");
function execute() {
    let response = fetch(BASE_URL + '/sets');

    if (response.ok) {
      let doc = response.html();
      var genre = [];
      if (doc) {
          var els = doc.select("span.tag-counterz a");
          els.forEach(e => {
              genre.push({
                  title: e.text(),
                  input: e.attr("href"),
                  script: "gen.js"
              });
          });
          return Response.success(genre);
      }
    }

    return null;
}

