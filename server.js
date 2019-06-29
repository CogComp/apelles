var browserify = require('browserify-middleware');
var express = require('express');
var app = express();
var path = require("path");
var hogan = require('hogan.js');
var requireText = require('require-text');
var minimist = require('minimist');

var argv = minimist(process.argv.slice(2), { boolean: ['r', 'f'] });

app.use(express.static(__dirname + '/public'));

var serverPort = argv['p'] || argv['port'] || 8080;

app.listen(serverPort);
console.log('Listening at http://localhost:' + serverPort);

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


