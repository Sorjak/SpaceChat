app.controller('AppCtrl', ['$scope', '$rootScope', '$interval', '$state', '$cookies', 'PlayerSocket', '$mdDialog', '$mdToast',
    function($scope, $rootScope, $interval, $state, $cookies, PlayerSocket, $mdDialog, $mdToast) {
    console.log("loaded app");

    $rootScope.socket = new PlayerSocket();
    $rootScope.player = null;
    $rootScope.player_list = null;
    
    $rootScope.connected = false;
    $rootScope.game_started = false;
    $rootScope.alert = null;
    $rootScope.alertTraitor = null;

    $scope.isTraitor = false;
    $scope.isRepairing = false;
    $scope.isSabotaging = false;

    $scope.logout = function() {
        console.log("Logging out");
        $rootScope.socket.disconnect();
        $interval.cancel($rootScope.heartbeat);
        
        $state.go("index");
    }

    $scope.sendHeartbeat = function() {
        $rootScope.socket.emit('heartbeat');
    }

    $scope.controls = function() {
        $state.go('player');
    }

    $scope.showAlert = function(text) {
        if (!$rootScope.alert) {
            $rootScope.alert = $mdToast.simple({
                textContent: text,
                parent: document.querySelectorAll('#toaster'),
                position: 'top',
                hideDelay: 3000
            });

            $mdToast.show( $rootScope.alert )
            .finally(function() {
                $rootScope.alert = null;
            });
        }
    }

    $scope.showTraitorMessage = function() {
        if (!$rootScope.alertTraitor) {
            $rootScope.alertTraitor = $mdDialog.alert({
                title: 'NOTICE',
                textContent: "You are now a SABOTEUR!",
                ok: 'Ok'
            });

            $mdDialog.show( $rootScope.alertTraitor )
            .finally(function() {
                $rootScope.alertTraitor = null;
            });
        }
    }

    $scope.join_game = function() {
        var playerName = $cookies.get('player_name');
        var playerKey  = $cookies.get('player_key');
        if (playerName !== undefined) {
            return $rootScope.socket.connect(playerName, playerKey).then(
                function(result) {
                    $rootScope.player = result;
                    $rootScope.heartbeat = $interval($scope.sendHeartbeat, 1000);
                }, function(failure) {
                    console.log("Failed to connect");
                }
            );
        }
    }



    $rootScope.socket.on('connect', function() {
        $rootScope.connected = true;
    });

    $rootScope.socket.on('game_started', function() {
        console.log("received game started");
        $rootScope.game_started = true;
    });

    $rootScope.socket.on('game_ended', function() {
        $rootScope.game_started = false;
        $rootScope.player = null;
        $state.go('index');
    });

    $rootScope.socket.on('update_player', function (data) {
        $rootScope.player = data.player;
        $rootScope.player_list = data.players;

        $scope.isTraitor = data.player.isTraitor;
        $scope.isRepairing = data.player.isRepairing;
        $scope.isSabotaging = data.player.isSabotaging;
    });

    $rootScope.socket.on('spacechat_error', function(error) {
        $scope.showAlert(error.errorMessage);

        $cookies.remove('player_name');
        $cookies.remove('player_key');
        $rootScope.player = null;
        $state.go('index');

    });

    $rootScope.socket.on('connect_error', function(error) {
        $rootScope.connected = false;
    });

    $rootScope.socket.on('disconnect', function() {
        $scope.showAlert("Disconnected from server.");

        $cookies.remove('player_name');
        $cookies.remove('player_key');
        $rootScope.game_started = false;
        $rootScope.connected = false;
        $rootScope.player = null;
        $state.go('index');
    });

    $scope.$watch('isTraitor', function(oldVal, newVal) {
        if ($scope.isTraitor && (oldVal !== newVal) && !$rootScope.alertTraitor) {
            $scope.showTraitorMessage();
        }
    });

    $scope.$watch('isRepairing', function(oldVal, newVal) {
        if ($scope.isRepairing && (oldVal !== newVal)) {
            var room = $rootScope.player.room;
            $scope.showAlert('Repairing the ' + room);
        }
    });

    $rootScope.socket.emit('is_game_started', null, function(is_started) {
        $rootScope.game_started = is_started;
        if (is_started){
            $scope.join_game();
        }
    });

}])


.controller('IndexCtrl', ['$scope', '$rootScope', '$state', '$cookies', 
    function($scope, $rootScope, $state, $cookies) {
    $scope.input_name = '';//!!$rootScope.player ? $rootScope.player.name : '';

    $scope.submitName = function(player_name) {
        if (player_name) {
            $cookies.put('player_name', player_name);
            //$scope.goFullScreen();

            $rootScope.socket.register(player_name).then(
                function(server_key) {
                    $cookies.put('player_key', server_key);
                    $scope.join_game().then(function() {
                        $state.go("crew_list");
                    });

                }, function (failure) {
                    $scope.showAlert("Could not register player: " + player_name);
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
        if ($scope.input_name == '') {
            elem.removeClass("col-xs-10 padded");
        } else {
            elem.addClass("col-xs-10 padded");
        }
    }

}])

.controller('PlayerCtrl', ['$rootScope', '$scope', '$state', '$interval', '$timeout', '$stateParams', '$mdDialog'
    , function($rootScope, $scope, $state, $interval, $timeout, $stateParams, $mdDialog) {

    $scope.page = $state.current.name;
    $scope.chat = "";
    $scope.chatMode = false;
    $scope.sabotageCooldown = 3000;
    $scope.allowSabotage = true;

    $scope.emojis = [
        {hex: String.fromCodePoint(0x1F603), shortcode: ":smiling-face:"},
        {hex: String.fromCodePoint(0x1F61E), shortcode: ":frowning-face:"},
        {hex: String.fromCodePoint(0x1F632), shortcode: ":open-mouth:"},
        {hex: String.fromCodePoint(0x1F62D), shortcode: ":loudly-crying:"},
        {hex: String.fromCodePoint(0x1F608), shortcode: ":horns:"},
        {hex: String.fromCodePoint(0x1F607), shortcode: ":halo:"}
    ];

    $scope.sabotage = function() {
        $scope.startSabotageCooldown();
        $rootScope.socket.emit('sabotage_room', null, function(data) {
            $scope.showAlert("Sabotaging " + data + "!");
        });
    }

    $scope.startSabotageCooldown = function() {
        $scope.allowSabotage = false;
        $timeout(() => {
            $scope.allowSabotage = true;
        }, $scope.sabotageCooldown);
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
        $scope.chatMode = true;
    }

    $scope.showControls = function() {
        $scope.chatMode = false;
    }

    $scope.sendEmoji = function(emoji_shortcode) {
        $rootScope.socket.emit('player_message', emoji_shortcode);
    }

    $scope.showPrompt = function(ev) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.prompt()
            .title('Send message to everyone.')
            .placeholder('Enter message here.')
            .ok('Send')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function(result) {
            $rootScope.socket.emit('player_message', result);
        }, function() {});
    };   

}])

.controller('ControlAreaCtrl', ['$scope', '$rootScope', 'ControlArea'
    , function($scope, $rootScope, ControlArea) {

    $scope.control_element = $("#player-controls");
    $scope.GAME_WIDTH = Math.min($scope.control_element.width(), 480);
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

    $scope.getDimensions = function() {
        var width = $('body').width();
        var height = $('body').height();
        return {'width' : width, 'height' : height};
    }

    $scope.$watch($scope.getDimensions, function(oldVal, newVal) {
        var dims = $scope.getDimensions();

        if (dims.width > dims.height) {
            $scope.RENDERER.view.style.width = $scope.control_element.width() + "px";
            $scope.RENDERER.view.style.height = $scope.control_element.height() + "px";
        } else {
            $scope.RENDERER.view.style.width = $scope.GAME_WIDTH + "px";
            $scope.RENDERER.view.style.height = $scope.GAME_HEIGHT + "px";
        }
    }, true);
    
    $scope.mainLoop = function() {
        $rootScope.animFrame = requestAnimationFrame($scope.mainLoop);

        // $scope.debugText.text = "X: " + $scope.control_area.input.x + ", Y: " + $scope.control_area.input.y;
        var input = $scope.control_area.input;
        if (input != null) {
            var to_send = {'x' : input.x, 'y' : input.y}
            if ($rootScope.connected){
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
    $scope.page = $state.current.name;

    $scope.$watch(function() {return $rootScope.player_list}, function() {
        $scope.players = $rootScope.player_list;
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
