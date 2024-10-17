const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

var express = require('express')
global.__app = express();

var server = require('http').Server(__app);

console.log(process.env.SPACECHAT_SERVER_URL);

global.__io = require('socket.io')(server, {
    cors: {
        origin: `${process.env.SPACECHAT_SERVER_URL}`,
        methods: ["GET", "POST"]
    }
});

global.__game = null;

var io = require('./io');

var SpaceChat = require('./spacechat');
var Player = require('./player');

// check for socket file and delete if exists

server.listen(3000);
