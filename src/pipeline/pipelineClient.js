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
            console.log(data);
			//console.log("hi");
			//console.log(data.views);
			
			var viewArray = data.views;
			for (var i = 0; i < viewArray.length; i++) 
			{
				var viewData = viewArray[i].viewData;
				for (var i2 = 0; i2 < viewData.length; i2++) 
				{
					var constituents = viewData[i2].constituents;
					for (var i3 = 0; i3 < constituents.length; i3++) 
					{
						var label = constituents[i3].label;
						//console.log(label);
						if(label.includes("DT"))
						{
							constituents[i3].label = 'en.wikipedia.org/wiki/Barack_Obama';
						}
					}
				}
			}
        },
        error: function() {
            console.log("error . . . ");
        }
    });
};

module.exports = {
    annotateText: getTextAnnotation
};