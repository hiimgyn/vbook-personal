load('config.js');
function execute() {
    let response = fetch(BASE_URL + '/genre');
    if (response.ok) {
        let doc = response.html();
        const data = [];
        doc.select('.page-genres li a').forEach(e => {
            let fullText = e.text();
            let spanText = e.select('span').text();
            let title = fullText.replace(spanText, '').trim();
            
            data.push({
                title: title,
                input: e.attr('href'),
                script: 'gen.js'
            });
        });
        return Response.success(data);
    }
    return null;
}