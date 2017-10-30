var $ = require('jquery');

var getTextAnnotation = function (pipelineConfiguration, text, views, api) {
    views = views || [];
    console.log("[pipelineClient.js]: views: " + views);
    payload = {
        text: text,
        views: views.join(',')
    };

    return $.ajax({
        url: api,
        data: payload,
        type: "GET",
        dataType: "json",
        success: function(data) {
            console.log("Received the response. . . ");
            console.log("[pipelineClient.js]: data: ");
            console.log(data)
        },
        error: function() {
            console.log("error . . . ");
        }
    });
};

module.exports = {
    annotateText: getTextAnnotation
};