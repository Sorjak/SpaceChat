app.controller('MapCtrl', ['$scope', '$rootScope', 'SpaceChat', 'MapSocket',
    function($scope, $rootScope, SpaceChat, MapSocket) {
    $scope.game = null;
    $scope.latest = [];
    $scope.showing = false;
    $scope.roomName = "";

    $scope.game_width = 1200;
    $scope.game_height = 600;

    $scope.renderer = null;
    $scope.stage = null;

    $scope.initPIXI = function() {
        var rendererOptions = {
            antialiasing: true,
            transparent: false,
            resolution: window.devicePixelRatio,
            autoResize: true,
        };
        $scope.renderer = new PIXI.autoDetectRenderer($scope.game_width, $scope.game_height, rendererOptions);
        $scope.stage = new PIXI.Container();
        $("#map").append($scope.renderer.view);
    }

    $scope.init = function()  {
        $scope.initPIXI();
        var background = new PIXI.Graphics();
        background.beginFill(0x337ab7);
        background.drawRect(0, 0, $scope.game_width, $scope.game_height);
        $scope.stage.addChild(background);

        $scope.game = new SpaceChat($scope.stage);
    }

    $scope.resetPlayers = function() {
        MapSocket.emit("remove_all_players");
    }

    $scope.updateRoom = function(player, roomName) {
        console.log(player.name + " moving into " + roomName);
        MapSocket.emit("update_player_room", {'name' : player.name, 'room' : roomName});
    }

    $scope.scramblePlayers = function() {
        MapSocket.emit("scramble_players");
    }


    $scope.mainLoop = function() {
        $rootScope.animFrame = requestAnimationFrame($scope.mainLoop);
           
        $scope.game.update(PIXI.ticker.shared.deltaTime);

        $scope.renderer.render($scope.stage);
    }

    $scope.init();
    $scope.mainLoop();

    
}]);