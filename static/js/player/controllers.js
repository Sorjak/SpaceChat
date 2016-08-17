app.controller('HeaderCtrl', function($scope, $state, $cookies, $rootScope, PlayerSocket) {
    $scope.player_name = $cookies.get('player_name');

    $scope.logout = function() {
        $cookies.remove("player_name");
        PlayerSocket.disconnect();

        if ($rootScope.animFrame != undefined) {
            cancelAnimationFrame($rootScope.animFrame);
        }

        $state.go("index");
    }

    $scope.settings = function() {
        if ($rootScope.animFrame != undefined) {
            cancelAnimationFrame($rootScope.animFrame);
        }

        $state.go("settings");
    }
})

.controller('PlayerCtrl', ['$scope', '$state', '$interval', '$stateParams','PlayerSocket', 'Player'
    , function($scope, $state, $interval, $stateParams, PlayerSocket, Player) {

    $scope.init = function() {
        $scope.connected = true;
        $scope.errorMessage = "";
        $scope.player = null;
        $scope.chat = "";

        if (!PlayerSocket.isConnected()) {
            PlayerSocket.reconnect();
            PlayerSocket.emit('player_connected', $stateParams.player_name);
        }

        PlayerSocket.on('update_player', function (data) {
            if ($scope.player == null) {
                $scope.player = new Player($stateParams.player_name);
            }

            $scope.player.isTraitor = data.player.isTraitor;
            $scope.player.room = data.player.room;
        });

        PlayerSocket.on('spacechat_error', function(error) {
            $scope.errorMessage = error.errorMessage;

            // Game hasn't started
            if (error.errorCode == 0) {
                $scope.connected = false;

            // Player name is already connected to server
            } else if (error.errorCode == 1) {
                $scope.connected = false;
                PlayerSocket.disconnect();

            // Player not in game
            } else if (error.errorCode == 2) {
                $scope.connected = false;
                // This shouldn't ever happen, but who knows!
            }
        });

        PlayerSocket.on('connect_error', function(error) {
            $scope.errorMessage = "Lost connection to server";
            $scope.connected = false;
        });
    }

    $scope.sendHeartbeat = function() {
        PlayerSocket.emit('heartbeat');
    }

    $scope.sabotage = function() {
        PlayerSocket.emit('sabotage_room');
    }

    $scope.sendChat = function() {
        PlayerSocket.emit('player_message', $scope.chat);
        $scope.chat = "";
    }

    $scope.clearChat = function() {
        $scope.chat = "";
    }

    $scope.reload = function() {
        $state.reload();
    }

    if ($stateParams.player_name != null && $stateParams.player_name != "") {
        $scope.init();
    }
    else {
        console.log("no player name provided");
    }
    heartbeat = $interval($scope.sendHeartbeat, 1000 * 15);

}])

.controller('ControlAreaCtrl', ['$scope', '$rootScope', 'ControlArea'
    , function($scope, $rootScope, ControlArea) {

    $scope.control_element = $("#player-controls");
    $scope.GAME_WIDTH = Math.min($scope.control_element.width(), 768);
    $scope.GAME_HEIGHT = $scope.GAME_WIDTH * .9;

    $scope.background = null

    $scope.control_area = null;
    $scope.debugText = null;

    var rendererOptions = {
        antialiasing: true,
        transparent: false,
        resolution: window.devicePixelRatio,
        autoResize: true,
    };
    $scope.RENDERER = new PIXI.autoDetectRenderer($scope.GAME_WIDTH, $scope.GAME_HEIGHT, rendererOptions);
    $scope.STAGE = new PIXI.Container();
    $scope.control_element.append($scope.RENDERER.view);

    $scope.background = new PIXI.Graphics();
    $scope.background.beginFill(0x337ab7);
    $scope.background.drawRect(0, 0, $scope.GAME_WIDTH, $scope.GAME_HEIGHT);
    $scope.STAGE.addChild($scope.background);

    var control_area_size = new PIXI.Point($scope.STAGE.width * .8, $scope.STAGE.width * .8);
    var control_area_center = new PIXI.Point(0, 0);
    $scope.control_area = new ControlArea($scope.STAGE, control_area_center, control_area_size);

    // $scope.debugText = new PIXI.Text("", {font:"12px Arial", fill:"black"});
    // $scope.debugText.position = new PIXI.Point(10, $scope.STAGE.height - 30);
    // $scope.STAGE.addChild($scope.debugText);

    $scope.getControlAreaWidth = function() {
        return $scope.control_element.width();
    }

    $scope.$watch($scope.getControlAreaWidth, function(oldVal, newVal) {
        $scope.RENDERER.view.style.width = newVal + "px";
        $scope.RENDERER.view.style.height = (newVal * .9) + "px";
    }, true);

    $scope.mainLoop = function() {
        $rootScope.animFrame = requestAnimationFrame($scope.mainLoop);

        // $scope.debugText.text = "X: " + $scope.control_area.input.x + ", Y: " + $scope.control_area.input.y;
            
        $scope.control_area.update(PIXI.ticker.shared.deltaTime);

        $scope.RENDERER.render($scope.STAGE);
    }

    $scope.mainLoop();
}])

.controller('IndexCtrl', ['$scope', '$state', '$cookies', function($scope, $state, $cookies) {
    $scope.player_name = "";

    $scope.submitName = function() {

        $cookies.put('player_name', $scope.player_name);
        $scope.goFullScreen();
        $state.go('player', {player_name: $scope.player_name});
    }


    $scope.goFullScreen = function() {
        var doc = window.document;
        var docEl = doc.documentElement;

        var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;

        if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
            requestFullScreen.call(docEl);
        }
    }

}])

.controller('SettingsCtrl',  ['$scope', '$state', '$cookies', function($scope, $state, $cookies, PlayerSocket) {
    $scope.connected = true;

}])

;