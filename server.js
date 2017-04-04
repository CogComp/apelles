var browserify = require('browserify-middleware');
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/text-viz.js', browserify('./index.js', { standalone: 'textViz' }));

app.listen(8080);
console.log('Listening at http://localhost:8080');
