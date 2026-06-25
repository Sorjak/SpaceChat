const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

var express = require('express')

__app.set('view engine', 'ejs');  //tell Express we're using EJS
__app.set('views', __dirname + '/../templates');  //set path to *.ejs files

__app.use('/static', express.static(__dirname + '/../static'));

// __app ENDPOINTS

protocol = process.env.SPACECHAT_SERVER_PROTOCOL;
host = process.env.SPACECHAT_SERVER_HOST;
port = process.env.SPACECHAT_CLIENT_PORT;
server_url = `${protocol}://${host}:${port}`;

__app.get('/', function(req, res){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    
    res.render('index', {
        player_url: `${server_url}/player`
    });
});

__app.get('/map', function(req, res){
    res.render('map', {
        map_url: `${server_url}/map`
    });
});
