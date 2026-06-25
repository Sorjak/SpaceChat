const fs = require('fs');
const path = require('path');

var express = require('express')
global.__app = express();

var player_server = require('http').Server(__app);

global.__io = require('socket.io')(player_server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

global.__game = null;

var io = require('./io');

var SpaceChat = require('./spacechat');
var Player = require('./player');
const { Socket } = require('socket.io');

var urls = require('../controllers/urls');

protocol = process.env.SPACECHAT_SERVER_PROTOCOL;
server_host = process.env.SPACECHAT_SERVER_HOST;
server_port = process.env.SPACECHAT_SERVER_PORT;
console.log(`Server listening for clients at ${protocol}://${server_host}:${server_port}`);

player_server.listen(server_port);
