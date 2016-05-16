
function SpaceChat() {
    this.players = [];
    this.traitors = [];
}
// class methods

SpaceChat.prototype.PlayerExists = function(playerName) {
    return this.getPlayerByName(playerName) !== null;
}

SpaceChat.prototype.AddPlayer = function(playerObj) {
    if (this.traitors.length < this.players.length / 4) {
        // not enough traitors
        var ratio = ((this.players.length % 4) + 1) / 4;
        var ran = Math.random();

        if (ran < ratio) {
            playerObj.isTraitor = true;
            this.traitors.push(playerObj);
        }
    }

    this.players.push(playerObj);
};

SpaceChat.prototype.RemovePlayer = function(playerObj) {
    var index = this.players.indexOf(playerObj);
    if (index > -1) {
        this.players.splice(index, 1);
    }
    var t_index = this.traitors.indexOf(playerObj);
    if (t_index > -1) {
        this.traitors.splice(t_index, 1);
    }
};

SpaceChat.prototype.RemoveAllPlayers = function() {
    this.players = [];
    this.traitors = [];
};

SpaceChat.prototype.getPlayerByName = function(playerName) {
    var output = null;
    this.players.forEach(function(player) {
        if (player.name == playerName)
            output = player;
    });

    return output;
}
    

// export the class
module.exports = SpaceChat;

var map = __io.of('/map');
map.on('connection', function(socket){
    console.log("map connected");
    if (__game == null) {
        console.log("starting new game");
        __game = new SpaceChat();
    }

    console.log("Current game has: " + __game.players.length + " players");

    setInterval(updateMap, 10, socket);
    setInterval(heartbeat, 30000);

    socket.on("update player position", function(data) {
        var player = __game.getPlayerByName(data.id);
        player.positionX = data.index.x;
        player.positionY = data.index.y;
    });

    socket.on("remove all players", function(data) {
        console.log("removing all players");
        __game.RemoveAllPlayers();
    });
});

function updateMap(socket) {
    socket.emit('update players', {'players' : __game.players});
}

function heartbeat() {
    now = new Date();

    // check if all players who have an ID are still active
    __game.players.forEach(function(player) {
        if (player.id != null) {
            if (now - player.last_updated > (1000 * 60)) {
                console.log("Player " + player.name + " timed out.");
                player.id = null;
            }
        }
    });

    console.log("Current game has: " + __game.players.length + " players");
    
}