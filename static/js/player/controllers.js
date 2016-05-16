app.controller('PlayerCtrl', ['$scope', '$state', '$interval', '$stateParams','PlayerSocket', 'Player'
    , function($scope, $state, $interval, $stateParams, PlayerSocket, Player) {

    $scope.init = function() {
        $scope.connected = true;
        $scope.errorMessage = "";
        $scope.player = null;
        $scope.chat = "";

        PlayerSocket.emit('player connected', $stateParams.player_name);

        PlayerSocket.on('update player', function (data) {
            if ($scope.player == null)
                $scope.player = new Player($stateParams.player_name);

            $scope.player.isTraitor = data.player.isTraitor;
            $scope.player.room = data.player.room;
        });

        PlayerSocket.on('spacechat-error', function(error) {
            $scope.errorMessage = error.errorMessage;

            if (error.errorCode == 0) {
                $scope.connected = false;

            } else if (error.errorCode == 1) {
                $scope.connected = false;
                PlayerSocket.disconnect();

            } else if (error.errorCode == 2) {

            }
        });
    }

    $scope.sendHeartbeat = function() {
        PlayerSocket.emit('heartbeat');
    }

    $scope.sabotage = function() {
        console.log("SABOTAGE");
    }

    $scope.sendChat = function() {
        PlayerSocket.emit('player message', $scope.chat);
    }

    $scope.clearChat = function() {
        $scope.chat = "";
    }

    $scope.init();
    heartbeat = $interval($scope.sendHeartbeat, 1000 * 15);

}])

.controller('ControlAreaCtrl', ['$scope', 'PlayerSocket', 'ControlArea'
    , function($scope, PlayerSocket, ControlArea) {
    $scope.GAME_WIDTH = Math.min(window.innerWidth, 768);
    $scope.GAME_HEIGHT = $scope.GAME_WIDTH * .9;

    $scope.background = null

    $scope.control_area = null;
    $scope.debugText = null;


    var rendererOptions = {
        antialiasing: true,
        transparent: false,
        resolution: window.devicePixelRatio,
        autoResize: true,
    }
    $scope.RENDERER = new PIXI.autoDetectRenderer($scope.GAME_WIDTH, $scope.GAME_HEIGHT, rendererOptions);
    $scope.STAGE = new PIXI.Container();
    $("#player-controls").append($scope.RENDERER.view);


    $scope.background = new PIXI.Graphics();

    $scope.background.beginFill(0xEEEEEE);
    $scope.background.drawRect(0, 0, $scope.GAME_WIDTH, $scope.GAME_HEIGHT);

    $scope.STAGE.addChild($scope.background);

    var control_area_size = new PIXI.Point($scope.STAGE.width * .8, $scope.STAGE.width * .8);
    var control_area_center = new PIXI.Point(0, 0);
    
    $scope.control_area = new ControlArea($scope.STAGE, control_area_center, control_area_size);

    $scope.debugText = new PIXI.Text("", {font:"12px Arial", fill:"black"});
    $scope.debugText.position = new PIXI.Point(0, $scope.STAGE.height - 30);
    $scope.STAGE.addChild($scope.debugText);

    $scope.updatePlayerMove = function(playerInput) {
        var to_send = {'x' : playerInput.x, 'y' : playerInput.y}
        PlayerSocket.emit('move player', to_send);
    }

    $scope.mainLoop = function() {
        requestAnimationFrame($scope.mainLoop);

        if ($scope.control_area.input != null)
            $scope.debugText.text = "X: " + $scope.control_area.input.x + ", Y:" + $scope.control_area.input.y;
            $scope.updatePlayerMove($scope.control_area.input);

        $scope.RENDERER.render($scope.STAGE);
    }

    $scope.mainLoop();
}])

.controller('IndexCtrl', ['$scope', '$state', '$cookies', function($scope, $state, $cookies) {
    $scope.player_name = "";

    $scope.submitName = function() {

        $cookies.put('player_name', $scope.player_name);
        $state.go('player', {player_name: $scope.player_name});
    }

}])

;