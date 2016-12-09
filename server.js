var browserify = require('browserify-middleware');
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/text-viz.js', browserify('./index.js'));

app.listen(3000);
console.log('Listening on port 3000');