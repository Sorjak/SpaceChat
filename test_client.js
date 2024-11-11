const { io } = require("socket.io-client");

TEST_PLAYERS = process.argv[2] ?? 10;
console.log(`Starting test with ${TEST_PLAYERS} players.`);

// const map_socket = io('http://localhost:3001/map');

// map_socket.on('connect', () => {
//     spawnPlayers(TEST_PLAYERS);
// })

spawnPlayers(TEST_PLAYERS);

function spawnPlayers(num_players) {
    for (var i = 0; i < num_players; i++) {
        var playerID = `test${i}`;
        connectPlayer(playerID);
    }
}

function movePlayer(socket) {
    var x = Math.floor(Math.random() * 65534);
    var y = Math.floor(Math.random() * 65534);
    var o = BigInt(x) ^ (BigInt(y) << BigInt(16));

    socket.emit('move_player', parseInt(o, 10));
}

function heartbeatPlayer(socket) {
    socket.emit('heartbeat');
}

function connectPlayer(playerID) {
    var updateHandler = null;
    var heartbeat = null;

    const socket = io('https://localhost:3000/player', {rejectUnauthorized: false});

    socket.on("connect", () => {
        console.log(`Connected to player server with ID: ${socket.id}`);

        socket.emit('register_new_player', playerID, (result) => {
            if (result) {
                const playerInfo = {
                    username: playerID,
                    key: result
                }

                socket.emit('player_connected', playerInfo, (result) => {
                    if (result) {
                        updateHandler = setInterval(movePlayer, 2000, socket);
                        heartbeat = setInterval(heartbeatPlayer, 10000, socket);
                    }
                });
            }
        });
    });

    socket.on("disconnect", () => {
        console.log(`Disconnected from player server`);
        updateHandler = null;
    });

    socket.on("spacechat_error", (error) => {
        console.log(error);
        updateHandler = null;
    });
}
