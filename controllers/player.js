
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

}
// class methods

// export the class
module.exports = Player;

var playerSocket = __io.of('/player');
playerSocket.on('connection', function(socket) {
    var player = null;

    if (__game == null) {
        socket.emit("spacechat-error", {"errorCode" : 0, "errorMessage" : "game hasn't started"});

    } else {
        socket.on('disconnect', function() {
            if (player != null && player.id == socket.id) {
                console.log("player " + player.name + " disconnected");
                player.id = null;
            }
        });

        socket.on('player connected', function(username) {
            console.log('player provided username: ' + username);
            if (!__game.PlayerExists(username)) {
                player = new Player(socket.id, username);
                __game.AddPlayer(player);
                socket.emit("update player", {'player' : player});

            } else {
                player = __game.getPlayerByName(username);
                if (player.id == null) {
                    player.id = socket.id;

                    socket.emit("update player", {'player' : player});

                } else {
                    console.log("player " + username + " already connected");
                    socket.emit("spacechat-error", {"errorCode" : 1, "errorMessage" : "player already connected"});

                }
            }

        });

        // Expects an object with x and y, both floats between (-1, 1)
        socket.on('move player', function(playerInput) {
            if (player != null && player.id == socket.id) {
                if (__game.PlayerExists(player.name)) {
                    player.currentInput = playerInput;

                    socket.emit("update player", {'player' : player});
                } else {
                    socket.emit("spacechat-error", {"errorCode" : 2, "message" : "player not in game"});
                }
            }
        });

        socket.on('sabotage room', function() {
            if (player != null && player.id == socket.id) {
                if (player.room != "") 
                    console.log(player.name + " is sabotaging room: " + player.room);
                else 
                    console.log(player.name + " isn't in a sabotageable room");
            }
        });

        socket.on('player message', function(message) {
            if (player != null && player.id == socket.id) {
                console.log(player.name + " set message to: " + message);
                player.message = message;
            }
        });

        socket.on('heartbeat', function() {
            if (player != null && player.id == socket.id) {
                player.last_updated = new Date(); // reset last_updated to now
            }
        });
    }

});