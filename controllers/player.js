
function Player(id, name) {
    this.positionX = 0;
    this.positionY = 0;
    this.last_updated = new Date();

    this.currentInput = null;

    this.name = name;
    this.id = id;

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
            socket.emit("spacechat_error", {"errorCode" : 0, "errorMessage" : "Game hasn't started."});
        } else if (code == 1) {
            socket.emit("spacechat_error", {"errorCode" : 1, "errorMessage" : "This name is taken by someone else."});
        } else if (code == 2) {
            socket.emit("spacechat_error", {"errorCode" : 2, "message" : "Player name not in game."});
        }
    }

    socket.on('disconnect', function() {

        if (player != null && player.id == socket.id) {
            console.log("player " + player.name + " disconnected");
            player.id = null;
        }
    });

    socket.on('player_connected', function(username, callback) {
        console.log('player provided username: ' + username);

        if (__game == null) {
            console.log("error, game hasn't started");
            sendError(0);
            callback(null);

        } else {
            if (!__game.PlayerExists(username)) {
                player = new Player(socket.id, username);
                __game.AddPlayer(player);
                callback(player);

            } else {
                player = __game.getPlayerByName(username);
                if (player.id == null) {
                    player.id = socket.id;
                    player.last_updated = new Date();
                    callback(player);

                } else {
                    console.log("player " + username + " already connected");
                    sendError(1);
                    callback(null);
                }
            }
        }

    });

    socket.on('player_reconnect', function(username, callback) {
        if (__game == null) {
            sendError(0);

        } else {
            player = __game.getPlayerByName(username);
            if (player) {
                player.id = socket.id;
                player.last_updated = new Date();
                callback(player);
            } else {
                sendError(2);
            }
        }
        
    });

    // Expects an object with x and y, both floats between (-1, 1)
    socket.on('move_player', function(playerInput, callback) {
        if (__game == null) {
            sendError(0);

        } else {
            if (player != null && player.id == socket.id) {
                if (__game.PlayerExists(player.name)) {
                    player.currentInput = playerInput;

                    callback(player);
                } else {
                    sendError(2);
                }
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

});