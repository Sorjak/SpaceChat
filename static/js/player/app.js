var app = angular.module('SpaceChat', ['ui.router']);

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
    .state('map', {
        url: "/map",
        templateUrl: "/static/partials/map.html"
    })

});