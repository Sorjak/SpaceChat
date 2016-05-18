app.controller('MapCtrl', ['$scope', 'MapSocket', function($scope, MapSocket) {
    $scope.players = [];
    $scope.latest = [];
    $scope.showing = false;
    $scope.roomName = "";

    MapSocket.on('update_players', function (data) {
        // $scope.latest = data.players;
        angular.forEach(data.players, function(player, index) {
            var local_player = null;

            if ($scope.players[index]) {
                local_player = $scope.players[index];
            } else {
                local_player = player;
                $scope.players[index] = local_player;
            }

            local_player.currentInput = sanitizeInput(player.currentInput);
            local_player.id = player.id;
            local_player.room = player.room;
            local_player.message = player.message;
            local_player.last_updated = player.last_updated;
        });
    });

    $scope.refreshPlayers = function() {
        $scope.players = $scope.latest;
    }

    $scope.resetPlayers = function() {
        MapSocket.emit("remove_all_players");
    }

    $scope.updateRoom = function(player, roomName) {
        console.log(player.name + " moving into " + roomName);
        MapSocket.emit("update_player_room", {'name' : player.name, 'room' : roomName});
    } 

    function sanitizeInput(input) {
        return {
            x : Math.floor(input.x * 100) / 100,
            y : Math.floor(input.y * 100) / 100
        };

    }
}]);