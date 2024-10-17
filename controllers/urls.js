const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

var express = require('express')

__app.set('view engine', 'ejs');  //tell Express we're using EJS
__app.set('views', __dirname + '/../templates');  //set path to *.ejs files

__app.use('/static', express.static(__dirname + '/../static'));

// __app ENDPOINTS

__app.get('/', function(req, res){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    
    res.render('index', {player_url: process.env.SPACECHAT_PLAYER_URL});
});

__app.get('/map', function(req, res){
    res.render('map');
});

