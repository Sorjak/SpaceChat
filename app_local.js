var fs = require('fs');
var express = require('express')
global.__app = express();

var server = require('http').Server(__app);
global.__io = require('socket.io')(server);

global.__game = null;

var ejs = require('ejs');

var urls = require('./controllers/urls');
var io = require('./controllers/io');

var SpaceChat = require('./controllers/spacechat');
var Player = require('./controllers/player');

// check for socket file and delete if exists

server.listen(8000);


