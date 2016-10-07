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

    function fetchPlayerFromServer(playerName, toState) {
        PlayerSocket.connect(playerName)
        .then(function(server_player) {
            $rootScope.player = server_player;
            $state.go(toState);
        }).catch(function(data, status) {
            console.log(status);
        });
    }

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {
        if (toState.name != "index") {
            var playerName = $cookies.get('player_name');

            if (playerName) {
                // Player name exists in cookies

                if ($rootScope.player) {
                    // root player is not null

                    if ($rootScope.player.name == playerName) {
                        // root player equals cookie player - good to go

                    } else {
                        // root player does not equal cookie player - fetch player from server
                        event.preventDefault();
                        fetchPlayerFromServer(playerName, toState);
                    }

                } else {
                    // root player is null - fetch new player
                    event.preventDefault();
                    fetchPlayerFromServer(playerName, toState);
                }


            } else {
                // No player name in db
                event.preventDefault();
                $state.go("index");
            }
        }
    });

});