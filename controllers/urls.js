const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

var express = require('express')

__app.set('view engine', 'ejs');  //tell Express we're using EJS
__app.set('views', __dirname + '/../templates');  //set path to *.ejs files

__app.use('/static', express.static(__dirname + '/../static'));

// __app ENDPOINTS

server_host = process.env.SPACECHAT_SERVER_HOST;

player_port = process.env.SPACECHAT_SERVER_PLAYER_PORT;
player_url = `https://${server_host}:${player_port}/player`

map_port = process.env.SPACECHAT_SERVER_MAP_PORT;
map_url = `http://${server_host}:${map_port}/map`

__app.get('/', function(req, res){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    
    res.render('index', {
        player_url: player_url
    });
});

__app.get('/map', function(req, res){
    res.render('map', {
        map_url: map_url
    });
});

