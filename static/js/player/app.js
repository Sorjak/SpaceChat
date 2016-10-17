var app = angular.module('SpaceChat', ['ui.router', 'ngCookies']);

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
        if ($rootScope.error) {
            event.preventDefault();
            $rootScope.error = null;
        }

        if (toState.name != "index") {
            var playerName = $cookies.get('player_name');

            if (!playerName || !$rootScope.player) {
                event.preventDefault();
                $state.go("index");
            }
        }
    });

});