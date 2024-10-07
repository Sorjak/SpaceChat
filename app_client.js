var fs = require('fs');
var express = require('express')
global.__app = express();

var server = require('http').Server(__app);

var ejs = require('ejs');

var urls = require('./controllers/urls');

server.listen(8000);


