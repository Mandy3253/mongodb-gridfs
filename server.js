var express = require('express');
var Busboy = require('busboy');
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/test5');
var conn = mongoose.connection;
console.log(conn.db);
var fs = require('fs');
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var app = express();
conn.once('open', function () {
var gfs = Grid(conn.db);



                     app.post('/file', function(req, res) {
                fs.writeFile("/home/irisindpc2/sites/Grid-Fs/test.txt",JSON.stringify(req.headers), function(err) {
                        if(err) {
                        return console.log(err);
                        }
                console.log("The file was saved!");
                }); 
                        //console.log( req.headers );

                          var busboy = new Busboy({ headers : req.headers });
                          var fileId = mongoose.Types.ObjectId();
                          busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
                                    console.log('got file', filename, mimetype, encoding);
                                    var writeStream = gfs.createWriteStream({
                                      _id: fileId,  
                                      filename: filename,
                                      mode: 'w',
                                      content_type: mimetype,
                                    });
                                    file.pipe(writeStream);
                          })

                          .on('finish', function() {
                                        res.writeHead(200, {'content-type': 'text/html'});
                                        res.end('<p>File Uploaded Sucessfully </p><br><a href="/download/' + fileId.toString() + '">Download file</a>');
                              });

                          req.pipe(busboy);

                 
                });  
                app.get('/download/:id', function(req, res) {
                  gfs.findOne({ _id: req.params.id }, function (err, file) {
                    console.log(file);
                    if (err) return res.status(400).send(err);
                    if (!file) return res.status(404).send('');
                    
                    res.set('Content-Type', file.contentType);
                    res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
                    
                    var readstream = gfs.createReadStream({
                      _id: file._id
                    });
                    
                    readstream.on("error", function(err) {
                      console.log("Got error while processing stream " + err.message);
                      res.end();
                    });
                    
                    readstream.pipe(res);
                  });
                });

 });  

                    app.get('/', function(req, res) {
                        res.writeHead(200, {'content-type': 'text/html'});
                      res.end(
                        '<form action="/file" enctype="multipart/form-data" method="post">'+
                        '<input type="file" name="file"><br>'+
                        '<input type="submit" value="Upload">'+
                        '</form>'
                      );
                    });


app.listen(8080);
console.log('Server running at http://localhost:8080/');
