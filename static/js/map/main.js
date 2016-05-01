// requirejs(["/static/js/lib/jquery.min.js"], function(jQuery) {   
$(function() { 
    players = []

    remote = io('/map');

    remote.on('update players', function (data) {
        

        players = data.players;

        // data.players.forEach(function(server_player, idx) {

        //     // $("#player-list").append("<li>" + server_player.name + ": " 
        //     //     + server_player.currentInput.x + ", " 
        //     //     + server_player.currentInput.y + 
        //     players[idx] = server_player;
        //     var output = "<li><a href='" + idx +"' class='info'>" + server_player.name +  "</a></li>";

        //     $("#player-list").append(output);
        // });
    });

    $("#reset").on('click', function(e) {
        e.preventDefault();

        remote.emit("remove all players");
    });

    $("#player-list").on('click', 'li a', function(e) {
        e.preventDefault();
        var id = $(this).attr('href');

        console.log(players[id]);
    });

    setInterval(listPlayers, 1000);
});

function listPlayers() {
    $("#player-list").empty();
    players.forEach(function(player, idx) {

        // $("#player-list").append("<li>" + server_player.name + ": " 
        //     + server_player.currentInput.x + ", " 
        //     + server_player.currentInput.y + 
        var output = "<li><a href='" + idx +"' class='info'>" + player.name +  "</a></li>";

        $("#player-list").append(output);
    });
}