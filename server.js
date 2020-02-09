var browserify = require('browserify-middleware');
var express = require('express');
var app = express();
var path = require("path");
var hogan = require('hogan.js');
const bodyParser = require('body-parser');
var requireText = require('require-text');
var fs = require('fs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));


var PORT = 4006;
app.listen(PORT);
console.log('Listening at http://localhost:'+PORT);

app.get('/embed.css', browserify('./public/embed.css', {}));
app.get('/apelles.js', browserify('./index.js', {standalone: 'apelles'}));

app.get('/render', function (req, res) {
    console.log("get request . . ");
    //res.set('Content-Type', 'application/javascript');
    var text = req.param('text');
    var viewNames = req.param('viewNames');

    var index = requireText('./public/index.html', require);
    
  
    
    var template = hogan.compile(index);

    var context = {_content_rendered_: "true", text: text, viewNames: viewNames};
    var partial = {};
    var output = template.render(context, partial);

    res.send(output);
});

app.get('/:default_annotation', function (req, res) {
    res.sendFile( __dirname + '/public/index.html')
});

app.post('/update_stats', function (req, res) {
    
	//console.log("posting");
	var selected_buttons_from_client = req.body.data;
	
	var file_path = "client_stats.json"
	
	var stats_map = {};
	
	try 
	{
		if (fs.existsSync(file_path)) 
		{
			stats_map = JSON.parse(fs.readFileSync(file_path, 'utf8'));
		}
	} catch(err) {
	  
	  //console.error(err)
	  
	}
	
	selected_buttons_from_client = selected_buttons_from_client.split(",");
	selected_buttons_from_client.forEach( function(item) 
	{
		if(stats_map.hasOwnProperty(item))
			stats_map[item]+=1;
		else
			stats_map[item]=1;
	});
	
	//console.log(JSON.stringify(stats_map));
	
	fs.writeFileSync(file_path, JSON.stringify(stats_map));

});
