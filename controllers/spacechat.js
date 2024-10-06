
function SpaceChat(max) {
    this.traitor_cutoff = 8;
    this.max_players = max;
    this.players = [];
    this.traitors = [];
}
// class methods

SpaceChat.prototype.PlayerExists = function(playerName) {
    return this.getPlayerByName(playerName) !== null;
}

SpaceChat.prototype.AddPlayer = function(playerObj) {
    if (this.players.length >= this.max_players) {
        return false;
    }

    this.assignPlayerFaction(playerObj, this.players.length, this.traitors.length);

    if (playerObj.isTraitor) {
        this.traitors.push(playerObj);
    }

    this.players.push(playerObj);
    console.log("Added player " + playerObj.name + " as " + playerObj.isTraitor);

    return true;

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
    if (totalTraitors < totalPlayers / this.traitor_cutoff) {
        // not enough traitors
        var ratio = ((totalPlayers % this.traitor_cutoff) + 1) / this.traitor_cutoff;
        var ran = Math.random();

        if (ran < ratio) {
            playerObj.isTraitor = true;
        }
    }

    if (playerObj.name == 'ulisses') {
        playerObj.isTraitor = true;
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

SpaceChat.prototype.switchPlayerFaction = function(playerObj) {
    var self = this;

    if (playerObj.isTraitor) {
        var t_index = this.traitors.indexOf(playerObj);
        if (t_index > -1) {
            this.traitors.splice(t_index, 1);
        }
    } else {
        this.traitors.push(playerObj);
    }

    playerObj.isTraitor = !playerObj.isTraitor;
}

SpaceChat.prototype.serializePlayers = function() {
    return {'players': this.players};
}
    

// export the class
module.exports = SpaceChat;

var map = __io.of('/map');
map.on('connection', function(map_socket){
    console.log("map_connected");
    if (__game == null) {
        console.log("starting new game");
        __game = new SpaceChat(64);
        __io.of('/player').emit('game_started');
    }

    map_socket.on('disconnect', function() {
        console.log("game client disconnected");
        __game = null;
        __io.of('/player').emit('game_ended');
    });

    console.log("Current game has: " + __game.players.length + " players");

    setInterval(updateMap, 10, map_socket);
    setInterval(heartbeat, 30000);

    map_socket.on("update_player_position", function(data) {
        if (__game !== null) {
            var _data = JSON.parse(data);

            try {
                var player = __game.getPlayerByName(_data.id);
                player.positionX = _data.index.x;
                player.positionY = _data.index.y;
            } catch (ex) {
                console.log("Player " + _data.name + " does not exist.");
            }
        }
    });

    map_socket.on("update_max_players", function(data) {
        if (__game !== null) {
            var _data = JSON.parse(data);

            console.log("changing max players to: " + _data.max);
            __game.max_players = _data.max;
        }
    });

    map_socket.on("update_player_room", function(data) {
        if (__game !== null) {
            var _data = JSON.parse(data);

            console.log(_data.name + " moving into " + _data.room);

            try {
                var player = __game.getPlayerByName(_data.name);
                player.room = _data.room;
            } catch (ex) {
                console.log("Player " + _data.name + " does not exist.");
            }
        }
    });

    map_socket.on("update_player_repair", function(data){
        if (__game !== null) {
            var _data = JSON.parse(data);

            console.log(_data.name + " moving into " + _data.room);

            try {
                var player = __game.getPlayerByName(_data.name);
                player.isRepairing = _data.isRepairing;
            } catch (ex) {
                console.log("Player " + _data.name + " does not exist.");
            }
        }

    });

    map_socket.on("ack_message", function(data) {
        if (__game !== null) {
            var _data = JSON.parse(data);

            console.log(_data.name + " acknowledged message");

            try {
                var player = __game.getPlayerByName(_data.name);
                player.message = "";
            } catch (ex) {
                console.log("Player " + _data.name + " does not exist.");
            }
        }
    });

    map_socket.on("ack_sabotage", function(data) {
        if (__game !== null) {
            var _data = JSON.parse(data);

            console.log(_data.name + " acknowledging the sabotaging of " + _data.room);
            try {
                var player = __game.getPlayerByName(_data.name);
                player.isSabotaging = false;
            } catch (ex) {
                console.log("Player " + _data.name + " does not exist.");
            }
        }
    });

    map_socket.on("remove_all_players", function(data) {
        if (__game !== null) {
            console.log("removing all players");
            __game.RemoveAllPlayers();
        }
    });

    map_socket.on("scramble_players", function(data) {
        if (__game !== null) {
            console.log("scrambling player factions");
            __game.scramblePlayerFactions();
        }
    });
    
    map_socket.on("switch_faction", function(data) {
        if (__game !== null) {
            var _data = JSON.parse(data);

            console.log(_data.name + " switching factions");
            try {
                var player = __game.getPlayerByName(_data.name);
                __game.switchPlayerFaction(player);
            } catch (ex) {
                console.log("Player " + _data.name + " does not exist.");
            }
        }

    })
});

function updateMap(map_socket) {
    if (__game !== null) {
        serialized_players = __game.serializePlayers()
        map_socket.emit('update_players', serialized_players);
    }
}

function heartbeat() {
    if (__game !== null) {
        now = new Date();

        // check if all players who have an ID are still active
        __game.players.forEach(function(player) {
            // if (player.id != null) {
                if (now - player.last_updated > (1000 * 30)) {
                    console.log("Player " + player.name + " timed out.");
                    __game.RemovePlayer(player);
                }
            // }
        });

        //console.log("Current game has: " + __game.players.length + " players");
    } else {
        console.log("Game hasn't started.");
    }
    
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
