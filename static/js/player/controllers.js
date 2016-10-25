app.controller('AppCtrl', ['$scope', '$rootScope', '$interval', '$state', '$cookies', 'PlayerSocket', '$mdDialog',
    function($scope, $rootScope, $interval, $state, $cookies, PlayerSocket, $mdDialog) {
    console.log("loaded app");

    $rootScope.socket = new PlayerSocket();
    $rootScope.player = null;
    $rootScope.player_list = null;
    $rootScope.connected = false;

    $scope.logout = function() {
        // $cookies.remove("player_name");
        $rootScope.socket.disconnect();
        $interval.cancel($rootScope.heartbeat);
        
        $state.go("index");
    }

    $scope.sendHeartbeat = function() {
        $rootScope.socket.emit('heartbeat');
    }

    $scope.crew_list = function() {
        $state.go("crew_list");
    }

    $scope.controls = function() {
        $state.go("player");
    }

    $scope.showAlert = function(text) {
        var alert = $mdDialog.alert({
            title: 'Alert',
            textContent: text,
            ok: 'Close'
        });

        $mdDialog.show( alert )
        .finally(function() {
            alert = undefined;
        });
    }

    $scope.connect = function(nextState) {
        var playerName = $cookies.get('player_name');
        var playerKey  = $cookies.get('player_key');

        $rootScope.socket.connect(playerName, playerKey).then(
            function(result) {
                $rootScope.player = result;
                $rootScope.connected = true;
                $rootScope.heartbeat = $interval($scope.sendHeartbeat, 1000);
                if (nextState) $state.go(nextState);
            }, function(failure) {
                $rootScope.connected = false;
                console.log("Failed to connect");
            }
        );
    }

    $rootScope.socket.on('update_player', function (data) {
        console.log("got update from server");
        $rootScope.player = data.player;
        $rootScope.player_list = data.players;
        $rootScope.connected = true;
    });

    $rootScope.socket.on('spacechat_error', function(error) {
        $scope.showAlert(error.errorMessage);
        if (error.errorCode == 3) {
            $cookies.put('player_name', null);
            $cookies.put('player_key', null);
            $state.go('index');
        }

    });

    $rootScope.socket.on('connect_error', function(error) {
        $rootScope.connected = false;
    });

    $scope.$watch(function() {return $rootScope.connected}, function(oldVal, newVal) {
        if (!$rootScope.connected) {
            if (oldVal !== newVal) {
                $scope.showAlert("Disconnected from server.");
            }

            // $scope.connect('crew_list');
        }


    });

}])


.controller('IndexCtrl', ['$scope', '$rootScope', '$state', '$cookies', 
    function($scope, $rootScope, $state, $cookies) {
    $scope.player_name = "";

    $scope.submitName = function() {
        if ($scope.player_name) {
            $cookies.put('player_name', $scope.player_name);
            //$scope.goFullScreen();

            $rootScope.socket.register($scope.player_name).then(
                function(server_key) {
                    $cookies.put('player_key', server_key);
                    $scope.connect('crew_list');

                }, function (failure) {
                    $scope.showAlert("Player name is already taken");
                }
            );
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

    $scope.changeClass = function() {
        var result = $(".spacechat-input-container");
        var elem = angular.element(result);
        if ($scope.player_name == '') {
            elem.removeClass("col-xs-10 padded");
        } else {
            elem.addClass("col-xs-10 padded");
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
        $scope.changeClass();
        $scope.showControls();
    }

    $scope.clearChat = function() {
        $scope.chat = "";
    }

    $scope.reload = function() {
        $state.reload();
    }

    $scope.changeClass = function() {
        var result = $(".spacechat-input-container");
        var elem = angular.element(result);
        if ($scope.chat == '') {
            elem.removeClass("col-xs-10 padded");
        } else {
            elem.addClass("col-xs-10 padded");
        }
    }

    $scope.shrinkControls = function() {
        $("#player-controls").hide();
    }

    $scope.showControls = function() {
        $("#player-controls").show();
        $(".chat-input").blur();
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
            if ($rootScope.socket.isConnected()){
                $rootScope.socket.emit('move_player', to_send);
            }
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

    $scope.$watch(function() {return $rootScope.player_list}, function() {
        $scope.players = $rootScope.player_list;
    });

    $scope.showPlayers = function() {
        $scope.players = [];
        $rootScope.socket.emit('get_all_players', null, function(data) {
            $scope.players = data;
        });
    }

    // $scope.showPlayers();

    // $rootScope.socket.connect($scope.player_name, server_key).then(
    //     function(success) {
    //         // $rootScope.connected = true;
    //         $state.go('crew_list');
    //     }, function(failure) {
    //         $rootScope.connected = false;
    //     }
    // );

}])

;
