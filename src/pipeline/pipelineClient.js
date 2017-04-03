var $ = require('jquery');

var getTextAnnotation = function (pipelineConfiguration, text, views) {
    views = views || [];

    payload = {
        text: text,
        views: views.join(',')
    };

    return $.ajax({
        url: "http://austen.cs.illinois.edu:8080/annotate",
        data: payload,
        type: "GET",
        dataType: "json",
        success: function(data) {
            console.log("Received the response. . . ");
            console.log(data);
        },
        error: function() {
            console.log("error . . . ");
        }
    });
};

module.exports = {
    annotateText: getTextAnnotation
};