var spacechat = require('./spacechat');
var Player = require('./player');

var game = null;

__io.on('connection', function(socket){
    console.log('new connection to server');

    socket.on('disconnect', function(){
        console.log('socket disconnected');
    });
});


var map = __io.of('/map');
map.on('connection', function(socket){
    console.log("map connected");
    if (game == null) {
        console.log("starting new game");
        game = new spacechat();
    }

    console.log("Current game has: " + game.players.length + " players");

    setInterval(updateMap, 10, socket);
    setInterval(heartbeat, 30000);

    socket.on("update player position", function(data) {
        var player = game.getPlayerByName(data.id);
        player.positionX = data.index.x;
        player.positionY = data.index.y;
    });

    socket.on("remove all players", function(data) {
        console.log("removing all players");
        game.RemoveAllPlayers();
    });
});

function updateMap(socket) {
    socket.emit('update players', {'players' : game.players});
}

function heartbeat() {
    console.log("Current game has: " + game.players.length + " players");
}

var playerSocket = __io.of('/player');
playerSocket.on('connection', function(socket) {
    var player = null;

    if (game == null) {
        socket.emit("spacechat-error", "game hasn't started");

    } else {
        socket.on('disconnect', function() {
            if (player != null) {
                console.log("player " + player.name + " disconnected");
                player.id = null;
            }
        });

        socket.on('player connected', function(username) {
            console.log('player provided username: ' + username);
            if (!game.PlayerExists(username)) {
                player = new Player(socket.id, username);
                game.AddPlayer(player);
                socket.emit("update player", {'player' : player});

            } else {
                player = game.getPlayerByName(username);
                if (player.id == null) {
                    player.id = socket.id;
                    return player;
                    socket.emit("update player", {'player' : player});

                } else {
                    console.log("player " + username + " already connected");
                    socket.emit("spacechat-error", {"errorCode" : 0, "errorMessage" : "player already connected"});

                }
            }

        });

        // Expects an object with x and y, both floats between (-1, 1)
        socket.on('move player', function(playerInput) {
            if (player != null) {
                if (game.PlayerExists(player.name)) {
                    player.currentInput = playerInput;

                    socket.emit("update player", {'player' : player});
                } else {
                    socket.emit("spacechat-error", {"errorCode" : 1, "message" : "player not in game"});
                }
            }
        });

        socket.on('player message', function(message) {
            if (player != null) {
                console.log(player.name + " set message to: " + message);
                player.message = message;
            }
        });
    }
});
