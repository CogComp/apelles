const path = require('path');
var fs = require('fs');
var browserify = require('browserify-middleware');
var express = require('express');
var minimist = require('minimist');
var _ = require('lodash');


var argv = minimist(process.argv.slice(2));
var serverPort = argv['port'] || 8080;
var annotationFolders = argv['_'];
if (annotationFolders.length == 0) {
    annotationFolders = [__dirname + '/public/comparison/left', __dirname + '/public/comparison/right'];
}


// Retrieve file list for every request might be slow, while allowing adding new files without restarting the server
function listAvailableAnnotations() {
    return Promise.all(_.map(annotationFolders, function (folder) {
        return new Promise(function (resolve, reject) {
            fs.readdir(folder, function (err, files) {
                if (!err) {
                    resolve(files);
                }
                else {
                    reject('Unable to read folder. ' + err);
                }
            });
        });
    })).then(function (results) {
        return _.intersection.apply(_, results);
    });
}


function generateFolderName(folder) {
    return path.basename(folder);
}


function getAvailableAnnotations(req, res) {
    listAvailableAnnotations().then(function (results) {
        res.json(results);
    }).catch(function (err) {
        console.log(err);
        res.status(500).json([]);
    });
}


function getAnnotation(req, res) {
    listAvailableAnnotations().then(function (results) {
        var files = req.query.annotations;
        if (!Array.isArray(files) || _.difference(files, results).length) {
            // Bad file access!
            console.log('Denied file access: ' + JSON.stringify(files));
            res.status(400).json([]);
            return;
        }

        return Promise.all(_.map(annotationFolders, function (folder) {
            return Promise.all(_.map(files, function (file) {
                return new Promise(function (resolve, reject) {
                    var fullPath = path.join(folder, file);
                    fs.readFile(fullPath, "utf8", function (err, data) {
                        if (!err) {
                            try {
                                var jsonData = JSON.parse(data);
                                resolve({folder: generateFolderName(folder), file: file, jsonData: jsonData});
                            } catch (err) {
                                reject('Unable to parse file: ' + fullPath + '\n' + err);
                            }
                        }
                        else {
                            reject('Unable to read file: ' + fullPath + '\n' + err);
                        }
                    })
                });
            }));
        })).then(function (dataList) {
            res.json({ folders: _.map(annotationFolders, generateFolderName), data: _.flatten(dataList) });
        });
    }).catch(function (err) {
        console.log(err);
        res.status(500).json([]);
    });
}


var app = express();
app.get('/', function (req, res) { res.sendFile(__dirname + '/public/comparison.html') });
app.get('/apelles.js', browserify(__dirname + '/index.js', { standalone: 'apelles' }));
app.get('/list', getAvailableAnnotations);
app.get('/get', getAnnotation);
app.use(express.static(__dirname + '/public'));
app.listen(serverPort);

console.log('Listening at http://localhost:' + serverPort);
