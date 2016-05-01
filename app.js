var fs = require('fs');
var express = require('express')
global.__app = express();

var server = require('http').Server(__app);
global.__io = require('socket.io')(server);

var ejs = require('ejs');

var urls = require('./controllers/urls');
var io = require('./controllers/io');

const socketFile = "/var/www/spacechat/run/spacechat.sock";

// check for socket file and delete if exists

fs.access(socketFile, fs.F_OK, (err) => {
    if (err) {
        start_server();
    }
    else {
        fs.unlink(socketFile, (err) => {
            if (err) throw err;
            start_server();
        });
    }
});

function start_server() {
    server.listen(socketFile)

    server.on('listening', function() {
        fs.chmodSync(socketFile, '777');
    });

    console.log('Server running at ' + socketFile);
}

