var fs = require('fs');
var express = require('express')
global.__app = express();

var server = require('http').Server(__app);
global.__io = require('socket.io')(server, {
    cors: {
        origin: "https://spacechat.lol",
        methods: ["GET", "POST"]
    }
});

global.__game = null;

var io = require('./io');

var SpaceChat = require('./spacechat');
var Player = require('./player');

// check for socket file and delete if exists

server.listen(3000);
