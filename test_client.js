const { io } = require("socket.io-client");
const { faker } = require("@faker-js/faker");

TEST_PLAYERS = process.argv[2] ?? 10;
console.log(`Starting test with ${TEST_PLAYERS} players.`);

START_MAP = process.argv[3] ?? false;

PLAYER_HOST = 'https://spacechat.lol:443/player'
MAP_HOST = 'http://local.spacechat.lol:3001/map'


function startMap() {
    const map_socket = io(MAP_HOST);

    // map_socket.on('connect', () => {
    //     spawnPlayers(TEST_PLAYERS);
    // });
}

function spawnPlayers(num_players) {
    for (var i = 0; i < num_players; i++) {
        var playerID = faker.person.firstName().toLowerCase();
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

    const socket = io(PLAYER_HOST, {transports: ['websocket'], rejectUnauthorized: false});

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

if (START_MAP) startMap();
spawnPlayers(TEST_PLAYERS);
console.log('players spawned')
