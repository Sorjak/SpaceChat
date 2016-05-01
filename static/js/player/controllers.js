app.controller('PlayerCtrl', ['$scope', 'SocketService', 'Player'
    , function($scope, SocketService, Player) {

    $scope.player = new Player(INPUT_NAME);
    $scope.chat = "";

    SocketService.emit('player connected', INPUT_NAME);

    SocketService.on('update player', function (data) {
        $scope.player.isTraitor = data.player.isTraitor;
        $scope.player.room = data.player.room;
    });

    SocketService.on('spacechat-error', function(error) {
        if (error.errorCode == 0) {
            SocketService.disconnect();
        } else if (error.errorCode == 1) {
        }
    });

    $scope.sabotage = function() {
        console.log("SABOTAGE");
    }

    $scope.sendChat = function() {
        SocketService.emit('player message', $scope.chat);
    }

    $scope.clearChat = function() {
        $scope.chat = "";
    }

}])

.controller('ControlAreaCtrl', ['$scope', 'SocketService', 'ControlArea'
    , function($scope, SocketService, ControlArea) {
    $scope.GAME_WIDTH = window.innerWidth;
    $scope.GAME_HEIGHT = window.innerWidth * .9;

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

    // The renderer will create a canvas element for you that you can then insert into the DOM.
    
    $scope.STAGE = new PIXI.Container();
    
    $("#player-controls").append($scope.RENDERER.view);
    $scope.background = new PIXI.Graphics();

    $scope.background.beginFill(0x0000FF);
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
        SocketService.emit('move player', to_send);
    }

    $scope.mainLoop = function() {
        requestAnimationFrame($scope.mainLoop);

        if ($scope.control_area.input != null)
            $scope.debugText.text = "X: " + $scope.control_area.input.x + ", Y:" + $scope.control_area.input.y;
            $scope.updatePlayerMove($scope.control_area.input);

        // debugText.text = "WINDOW: " + window.innerWidth + ", " + window.innerHeight +
        // " | $scope.RENDERER: " + Math.floor($scope.RENDERER.width) + ", " + Math.floor($scope.RENDERER.height) + 
        // " | STAGE: " + STAGE.width + ", " + STAGE.height;



        $scope.RENDERER.render($scope.STAGE);
    }

    $scope.mainLoop();
}]);