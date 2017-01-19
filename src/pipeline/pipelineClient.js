var $ = require('jquery');

var getTextAnnotation = function (pipelineConfiguration, text, views) {
    views = views || [];

    payload = {
        text: text,
        views: views.join(',')
    };

    return $.ajax({
        url: "http://localhost:9000/annotate",
        data: payload,
        type: "GET",
        dataType: "json"
    });
};

module.exports = {
    annotateText: getTextAnnotation
};