app.controller('AppCtrl', ['$scope', '$rootScope', '$interval', '$state', '$cookies', 'PlayerSocket', 
    function($scope, $rootScope, $interval, $state, $cookies, PlayerSocket) {
    $scope.errorMessage = "";
    $rootScope.connected = false;

    $rootScope.socket = new PlayerSocket();

    $scope.logout = function() {
        $cookies.remove("player_name");
        $rootScope.socket.disconnect();
        $interval.cancel($rootScope.heartbeat);
        
        $state.go("index");
    }

    $scope.crew_list = function() {
        $state.go("crew_list");
    }

    $scope.controls = function() {
        $state.go("player");
    }

    $rootScope.socket.on('update_player', function (data) {
        $rootScope.player = data.player;
    });

    $rootScope.socket.on('spacechat_error', function(error) {
        $rootScope.error = error;
    });

    $rootScope.socket.on('connect_error', function(error) {
        $scope.errorMessage = "Lost connection to server";
        $rootScope.error = {'errorMessage' : "Lost connection to server."}
    });

    $scope.$watch(function() {return $rootScope.error}, function() {
        if ($rootScope.error) {
            $state.go("index");
        }
    });

}])


.controller('IndexCtrl', ['$scope', '$rootScope', '$state', '$cookies', function($scope, $rootScope, $state, $cookies) {
    $scope.player_name = "";

    $scope.submitName = function() {
        if ($scope.player_name) {
            $cookies.put('player_name', $scope.player_name);
            $scope.goFullScreen();

            if (!$rootScope.socket.isConnected()) {
                $rootScope.socket.connect($scope.player_name).then(function() {
                    $state.go('crew_list');
                });
            } else {
                $state.go('crew_list');
            }
        } else {
            $rootScope.error = {'errorMessage' : "Must provide name to join game."}
        }
        
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

.controller('PlayerCtrl', ['$rootScope', '$scope', '$state', '$interval', '$stateParams','PlayerSocket', 'Player'
    , function($rootScope, $scope, $state, $interval, $stateParams, PlayerSocket, Player) {

    $scope.page = $state.current.name;
    $scope.player = $rootScope.player;
    $scope.chat = "";

    $scope.$watch(function() {return $rootScope.player}, function() {
        $scope.player = $rootScope.player;
    });

    $scope.sabotage = function() {
        $rootScope.socket.emit('sabotage_room');
    }

    $scope.sendChat = function() {
        $rootScope.socket.emit('player_message', $scope.chat);
        $scope.chat = "";
    }

    $scope.clearChat = function() {
        $scope.chat = "";
    }

    $scope.reload = function() {
        $state.reload();
    }
    

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
    $scope.background.beginFill(0xFF9000);
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
        var input = $scope.control_area.input;
        if (input != null) {
            var to_send = {'x' : input.x, 'y' : input.y}
            $rootScope.socket.emit('move_player', to_send);
        }

        $scope.RENDERER.render($scope.STAGE);
    }

    $scope.mainLoop();
}])



.controller('CrewListCtrl',  ['$rootScope', '$scope', '$state', '$interval', '$cookies', 'PlayerSocket'
    , function($rootScope, $scope, $state, $interval, $cookies, PlayerSocket) {

    $scope.players = [];
    $scope.player = $rootScope.player;
    $scope.page = $state.current.name;

    $scope.$watch(function() {return $rootScope.player}, function() {
        $scope.player = $rootScope.player;
    });

    $rootScope.socket.on('connect_error', function(error) {
        $scope.errorMessage = "Lost connection to server";
        $rootScope.connected = false;
    });

    $scope.showPlayers = function() {
        $scope.players = [];
        $rootScope.socket.emit('get_all_players', null, function(data) {
            $scope.players = data;
        });
    }

    $scope.showPlayers();

}])

;