
function SpaceChat() {
    this.players = [];
    this.traitors = [];
}
// class methods

SpaceChat.prototype.PlayerExists = function(playerName) {
    return this.getPlayerByName(playerName) !== null;
}

SpaceChat.prototype.AddPlayer = function(playerObj) {
    this.assignPlayerFaction(playerObj, this.players.length, this.traitors.length);

    if (playerObj.isTraitor) this.traitors.push(playerObj);

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

SpaceChat.prototype.assignPlayerFaction = function(playerObj, totalPlayers, totalTraitors) {
    if (totalTraitors < totalPlayers / 4) {
        // not enough traitors
        var ratio = ((totalPlayers % 4) + 1) / 4;
        var ran = Math.random();

        if (ran < ratio) {
            playerObj.isTraitor = true;
        }
    }

    playerObj.team = totalPlayers % 2 == 0 ? "red" : "blue";
}

SpaceChat.prototype.scramblePlayerFactions = function() {
    var self = this;
    shuffle(this.players);
    this.traitors = [];

    this.players.forEach(function(player, idx) {
        player.isTraitor = false;

        self.assignPlayerFaction(player, idx + 1, self.traitors.length);

        if (player.isTraitor) {
            self.traitors.push(player);
        }
    });
}
    

// export the class
module.exports = SpaceChat;

var map = __io.of('/map');
map.on('connection', function(socket){
    console.log("map_connected");
    if (__game == null) {
        console.log("starting new game");
        __game = new SpaceChat();
    }

    socket.on('disconnect', function() {
        console.log("game client disconnected");
        __game = null;
    });

    console.log("Current game has: " + __game.players.length + " players");

    setInterval(updateMap, 10, socket);
    setInterval(heartbeat, 30000);

    socket.on("update_player_position", function(data) {
        var _data = JSON.parse(data);

        var player = __game.getPlayerByName(_data.id);
        player.positionX = _data.index.x;
        player.positionY = _data.index.y;
    });

    socket.on("update_player_room", function(data) {
        var _data = JSON.parse(data);

        console.log(_data.name + " moving into " + _data.room);
        var player = __game.getPlayerByName(_data.name);
        player.room = _data.room;
    });

    socket.on("ack_message", function(data) {
        var _data = JSON.parse(data);

        console.log(_data.name + " acknowledged message");
        var player = __game.getPlayerByName(_data.name);
        player.message = "";
    });

    socket.on("ack_sabotage", function(data) {
        var _data = JSON.parse(data);

        console.log(_data.name + " sabotaging " + _data.room);
        var player = __game.getPlayerByName(_data.name);
        player.isSabotaging = false;
    });

    socket.on("remove_all_players", function(data) {
        console.log("removing all players");
        __game.RemoveAllPlayers();
    });

    socket.on("scramble_players", function(data) {
        console.log("scrambling player factions");
        __game.scramblePlayerFactions();
    });
});

function updateMap(socket) {
    socket.emit('update_players', {'players' : __game.players});
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

/**
 * Stolen from SO: http://stackoverflow.com/a/6274381
 * Shuffles array in place.
 * @param {Array} The array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}