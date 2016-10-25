var app = angular.module('SpaceChat', ['ui.router', 'ngCookies', 'ngMaterial']);

app.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/");
    $stateProvider.state('index', {
        url: "/",
        templateUrl: "/static/partials/index.html",
    })
    .state('player', {
        url: "/player",
        templateUrl: "/static/partials/player.html"
    })
    .state('crew_list', {
        url: "/crew-list",
        templateUrl: "/static/partials/crew_list.html",
    });

});

app.run(function ($rootScope, $state, $cookies, PlayerSocket) {

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {
        var playerName = $cookies.get('player_name');
        var playerKey  = $cookies.get('player_key');
        console.log(playerName + " " + toState.name);

        if (playerName == null || playerKey == null) {
            if (toState.name != "index") {
                event.preventDefault();
                $state.go("index");
            }
        }

        console.log($rootScope.connected);
        if (!$rootScope.connected) {
            event.preventDefault();

            $rootScope.socket.connect(playerName, playerKey).then(
                function(result) {
                    $rootScope.player = result;
                    $rootScope.connected = true;
                    $rootScope.heartbeat = $interval(function() {$rootScope.socket.emit('heartbeat');}, 1000);
                    $state.go(toState);
                }, function(failure) {
                    $rootScope.connected = false;
                    console.log("Failed to connect");
                }
            );
        }
    });

});