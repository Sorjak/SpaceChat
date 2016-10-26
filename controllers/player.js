
function Player(id, name) {
    this.positionX = 0;
    this.positionY = 0;
    this.last_updated = new Date();

    this.currentInput = null;

    this.name = name;
    this.id = id;
    this.key = Math.floor(Math.random() * 1000000);

    this.room = "";
    this.message = "";

    this.isTraitor = false;
    this.isSabotaging = false;
    this.team = "red";

}
// class methods

// export the class
module.exports = Player;

var playerSocket = __io.of('/player');
playerSocket.on('connection', function(socket) {
    var player = null;

    function sendError(code) {
        if (code == 0) {
            socket.emit("spacechat_error", {"errorCode" : code, "errorMessage" : "Game hasn't started."});
        } else if (code == 1) {
            socket.emit("spacechat_error", {"errorCode" : code, "errorMessage" : "This name is taken by someone else."});
        } else if (code == 2) {
            socket.emit("spacechat_error", {"errorCode" : code, "errorMessage" : "Player name not in game."});
        } else if (code == 3) {
            socket.emit("spacechat_error", {"errorCode" : code, "errorMessage" : "Player not registered"});
        } else if (code == 4) {
            socket.emit("spacechat_error", {"errorCode" : code, "errorMessage" : "Max player limit reached."});
        }
    }

    socket.on('disconnect', function() {

        if (player != null && player.id == socket.id) {
            console.log("player " + player.name + " disconnected");
            player.id = null;
        }
    });

    socket.on('register_new_player', function(username, callback) {
        if (__game == null) {
            console.log("error, game hasn't started");
            sendError(0);
            callback(false);
        } else {
            console.log("registering " + username);

            if (!__game.PlayerExists(username)) {
                player = new Player(null, username);
                if (__game.AddPlayer(player)) {
                    callback(player.key);
                } else {
                    sendError(4);
                    callback(false);
                }
                
            } else {
                console.log("player " + username + " already exists");
                callback(false);
            }
        }
    });

    socket.on('player_connected', function(playerInfo, callback) {
        if (__game == null) {
            console.log("error, game hasn't started");
            sendError(0);
            callback(false);
        } else {

            console.log(playerInfo);
            player = __game.getPlayerByName(playerInfo.username);
            if (player) {
                if (player.key == playerInfo.key) {
                    player.id = socket.id;
                    player.last_updated = new Date();

                    setInterval(updatePlayer, 1000, socket, player);

                    callback(player);
                }

            } else {
                console.log("player " + playerInfo.username + " not registered");
                sendError(3);
                callback(false);
            }
        }

    });

    // Expects an object with x and y, both floats between (-1, 1)
    socket.on('move_player', function(playerInput) {
        if (__game == null) {
            sendError(0);

        } else {
            if (player != null && player.id == socket.id) {
                player.currentInput = playerInput;
            }
        }
    });

    socket.on('sabotage_room', function() {
        if (__game == null) {
            sendError(0);

        } else {
            if (player != null && player.id == socket.id) {
                if (player.room != "") {
                    console.log(player.name + " is sabotaging room: " + player.room);
                    player.isSabotaging = true;
                }

            }
        }
    });

    socket.on('player_message', function(message) {
        if (__game == null) {
            sendError(0);

        } else {        
            if (player != null && player.id == socket.id) {
                console.log(player.name + " set message to: " + message);
                player.message = message;
            }
        }
    });

    socket.on('get_all_players', function(args, callback) {
        if (__game == null) {
            sendError(0);

        } else {        
            callback(__game.players);
        }
    });

    socket.on('heartbeat', function() {
        if (player != null && player.id == socket.id) {
            player.last_updated = new Date();
        }
    });

});

function updatePlayer(socket, player) {
    if (__game !== null) {
        socket.emit('update_player', {'player' : player,  'players' : __game.players});
    }
}