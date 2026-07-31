var fs = require('fs');
var express = require('express')
global.__app = express();

var server = require('http').Server(__app);
global.__io = require('socket.io')(server);

global.__game = null;

var ejs = require('ejs');

var urls = require('./controllers/urls');
var io = require('./server/io');

var SpaceChat = require('./server/spacechat');
var Player = require('./server/player');


server.listen(3001);
console.log('Listening on port 3001')

