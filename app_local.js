var fs = require('fs');
var express = require('express')
global.__app = express();

var server = require('http').Server(__app);
global.__io = require('socket.io')(server);

var ejs = require('ejs');

var urls = require('./controllers/urls');
var io = require('./controllers/io');

// check for socket file and delete if exists

server.listen(8000);


