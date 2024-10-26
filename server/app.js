const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

var express = require('express')
global.__app = express();

var map_server = require('http').Server(__app);

https_key = process.env.SPACECHAT_SERVER_HTTPS_KEY
https_cert = process.env.SPACECHAT_SERVER_HTTPS_CERT
console.log(`Using key: ${https_key} and cert ${https_cert} for https`);
const options = {
    key: fs.readFileSync(`./https/${https_key}`),
    cert: fs.readFileSync(`./https/${https_cert}`)
}
var player_server = require('https').Server(options, __app); // players require https

server_host = process.env.SPACECHAT_SERVER_HOST

global.__mapio = require('socket.io')(map_server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

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

map_port = process.env.SPACECHAT_SERVER_MAP_PORT
console.log(`Server listening for game client at http://${server_host}:${map_port}`)

player_port = process.env.SPACECHAT_SERVER_PLAYER_PORT
console.log(`Server listening for player clients at https://${server_host}:${player_port}`)

map_server.listen(map_port);
player_server.listen(player_port);
