var app = angular.module('SpaceChat', ['ui.router', 'ngCookies']);

app.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/");
    $stateProvider.state('index', {
        url: "/",
        templateUrl: "/static/partials/index.html",
        params: {
            title: "SpaceChat"
        }
    })
    .state('player', {
        url: "/player",
        params: {
            player_name: null, 
            reconnect: true,
            title: "SpaceChat"
        },
        templateUrl: "/static/partials/player.html"
    })
    .state('settings', {
        url: "/settings",
        templateUrl: "/static/partials/settings.html",
        params: {
            title: "Player List"
        }
    });

});

app.run(function ($rootScope, $state, $cookies) {

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {
        if (toState.name == "index") {
            var playerName = $cookies.get('player_name');

            if (playerName) {
                event.preventDefault();
                toParams.player_name = playerName;
                $state.go('player');
            }

        } else if (toState.name == "player") {
            var playerName = $cookies.get('player_name');
            
            if (playerName) {
                toParams.player_name = playerName;
            } else {
                event.preventDefault();
                $state.go('index');
            }

            if (fromState.name == "settings")
                toParams.reconnect = false;

        }
    });

});