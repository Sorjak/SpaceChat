app.factory('SpaceChat', function ($rootScope, MapSocket, Player, Ball, Wall, Goal) {

    function SpaceChat(player_container) {
        this.players = [];
        this.ball = new Ball(new PIXI.Point(200, 200), player_container);

        this.northWall = new Wall(player_container, new PIXI.Point(0, -48), new PIXI.Point(player_container.width, 48));
        this.westWall = new Wall(player_container, new PIXI.Point(-48, 0), new PIXI.Point(48, player_container.height));
        this.southWall = new Wall(player_container, new PIXI.Point(0, player_container.height), new PIXI.Point(player_container.width, 48));
        this.eastWall = new Wall(player_container, new PIXI.Point(player_container.width, 0), new PIXI.Point(48, player_container.height));

        this.blueGoal = new Goal(player_container, new PIXI.Point(0, 250), new PIXI.Point(24, 100), "blue");
        this.redGoal = new Goal(player_container, new PIXI.Point(player_container.width - 24, 250), new PIXI.Point(24, 100), "red");

        this.entities = [this.ball, this.northWall, this.westWall, this.southWall, this.eastWall, this.blueGoal, this.redGoal];

        self = this;
        MapSocket.on('update_players', function (data) {
            angular.forEach(data.players, function(server_player, index) {

                if (self.PlayerExists(server_player.name)){
                    var local_player = self.getPlayerByName(server_player.name);
                    local_player.updateInfo(server_player);

                } else {
                    var player_x = Math.random() * player_container.width;
                    var player_y = Math.random() * player_container.height;
                    var pos = new PIXI.Point(player_x, player_y);
                    self.AddPlayer(new Player(server_player, pos,  player_container));
                }
            });
        });

        this.graphics = new PIXI.Graphics();
        player_container.addChild(this.graphics);

        this.redScore = new PIXI.Text("", {font : '30px Arial', fill : 0xff0000, align : 'center'});
        this.redScore.x = player_container.width - 40;
        this.redScore.y = 20;

        this.blueScore = new PIXI.Text("", {font : '30px Arial', fill : 0x0000ff, align : 'center'});
        this.blueScore.x = 20;
        this.blueScore.y = 20;

        player_container.addChild(this.redScore);
        player_container.addChild(this.blueScore);

    }

    SpaceChat.prototype.update = function(deltaTime) {
        var self = this;
        var potentialCollisions = self.entities.concat(self.players);
        angular.forEach(potentialCollisions, function(e) {
            var filtered = potentialCollisions.filter(function(p) {
                var dist = p.position.distanceTo(e.position);
                return p.name != e.name;
            });

            e.checkCollisions(filtered);
            e.update(deltaTime);
            e.draw();
        });

        this.blueScore.text = this.redGoal.score;
        this.redScore.text = this.blueGoal.score;
    }

    SpaceChat.prototype.PlayerExists = function(playerName) {
        return this.getPlayerByName(playerName) !== null;
    }

    SpaceChat.prototype.AddPlayer = function(playerObj) {
        this.players.push(playerObj);
    };

    SpaceChat.prototype.RemovePlayer = function(playerObj) {
        var index = this.players.indexOf(playerObj);
        if (index > -1) {
            this.players.splice(index, 1);
        }
    };

    SpaceChat.prototype.RemoveAllPlayers = function() {
        this.players = [];
    };

    SpaceChat.prototype.getPlayerByName = function(playerName) {
        var output = null;
        this.players.forEach(function(player) {
            if (player.name == playerName)
                output = player;
        });

        return output;
    }

    return SpaceChat;
})





;