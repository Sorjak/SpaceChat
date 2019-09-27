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

        if (fromState.name == "player") {
            if ($rootScope.animFrame) {
                var cancelAnimFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
                cancelAnimFrame($rootScope.animFrame);
            }
        }

        if (!playerName || !playerKey) {
            if (toState.name != "index") {
                event.preventDefault();
                $state.go("index");
            }
        } else {
            if ($rootScope.game_started && 
                $rootScope.connected &&
                toState.name == "index") {
                event.preventDefault();
                $state.go("crew_list");
            }
        }
    });

});