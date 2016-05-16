app.controller('MapCtrl', ['$scope', 'MapSocket', function($scope, MapSocket) {
    $scope.players = [];
    $scope.latest = [];
    $scope.showing = false;

    MapSocket.on('update players', function (data) {
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

    // $("#player-list").on('click', 'li a', function(e) {
    //     e.preventDefault();
    //     var id = $(this).attr('href');

    //     console.log($scope.players[id]);
    // });

    $scope.refreshPlayers = function() {
        $scope.players = $scope.latest;
    }

    $scope.resetPlayers = function() {
        MapSocket.emit("remove all players");
    }

    function sanitizeInput(input) {
        return {
            x : Math.floor(input.x * 100) / 100,
            y : Math.floor(input.y * 100) / 100
        };

    }
}]);