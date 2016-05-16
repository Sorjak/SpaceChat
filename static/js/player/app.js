var app = angular.module('SpaceChat', ['ui.router', 'ngCookies']);

app.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/");
    $stateProvider.state('index', {
        url: "/",
        templateUrl: "/static/partials/index.html",
    })
    .state('player', {
        url: "/player",
        params: {
            player_name: null
        },
        templateUrl: "/static/partials/player.html"
    })

});

app.run(function ($rootScope, $state, $cookies) {

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
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

        }
    });

});