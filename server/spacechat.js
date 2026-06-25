TRAITOR_CUTOFF = process.env.SPACECHAT_SERVER_TRAITOR_CUTOFF ?? 6;
MAX_PLAYERS = process.env.SPACECHAT_SERVER_MAX_PLAYERS ?? 64;
UPDATE_TICK = process.env.SPACECHAT_SERVER_UPDATE_TICK ?? 100;
HEARTBEAT_TICK = process.env.SPACECHAT_SERVER_HEARTBEAT_TICK ?? 20000;

function SpaceChat() {
    this.traitor_cutoff = TRAITOR_CUTOFF;
    this.max_players = MAX_PLAYERS;
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

    var faction = this.GetFactionName(playerObj);
    console.log("Added player " + playerObj.name + " as " + faction);

    __io.of('/map').emit('player_joined', {players: [playerObj.serialize()]});
    return true;

};

SpaceChat.prototype.GetFactionName = function (playerObj) {
    return playerObj.isTraitor ? 'traitor' : 'crew';
}

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
    for (const player of this.players) {
        if (player.name.toLowerCase() == playerName.toLowerCase()) {
            output = player;
            break;
        }
    };

    return output;
}

SpaceChat.prototype.getPlayerById = function(socketId) {
    var output = null;
    for (const player of this.players) {
        if (player.id == socketId) {
            output = player;
            break;
        }
    };

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

    if (playerObj.name == 'benedictarnold') {
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

SpaceChat.prototype.getPlayerSocketById = function(player_id) {
    return __io.of('player').sockets.get(player_id);
}

SpaceChat.prototype.serializePlayers = function() {
    var serializedPlayers = [];
    for (const player of this.players) {
        if (player.id !== null) {
            serializedPlayers.push(player.serialize());
        }
    }

    // console.log(`Updating map with players: ${serializedPlayers.map(({ name, id }) => `${name} (${id})`)}`);
    return {'players': serializedPlayers};
}
    

SpaceChat.prototype.endGame = function() {
    var self = this;

    // for (const player of self.players) {
    //     var player_socket = self.getPlayerSocketById(player.id);
    //     player_socket.disconnect();
    // }
    __io.of('/player').emit('game_ended');
}

// export the class
module.exports = SpaceChat;

var map = __io.of('/map');
map.on('connection', function(map_socket){
    console.log("map_connected");
    if (__game == null) {
        __game = new SpaceChat();
        console.log(`starting new game with max players ${MAX_PLAYERS}, tick ${UPDATE_TICK}`);
        __io.of('/player').emit('game_started');
    }

    map_socket.on('disconnect', function() {
        console.log("game client disconnected");
        __game.endGame();
        __game = null;
        
    });

    console.log("Current game has: " + __game.players.length + " players");

    setInterval(updateMap, UPDATE_TICK, map_socket);
    setInterval(heartbeat, HEARTBEAT_TICK);

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
        for (const player of __game.players) {
            if (now - player.last_updated > (1000 * 30)) {
                console.log("Player " + player.name + " timed out.");
                __game.RemovePlayer(player);
            }
        };

        var num_players = __game.players.length;
        if (num_players > 0) {
            var player_names = __game.players.map((p) => {
                return `${p.name}(${__game.GetFactionName(p)[0]})`
            });
            console.log(`Current players (${num_players}): ${player_names}`);
        }
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
