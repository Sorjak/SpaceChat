app.factory('Player', function (MovingObject, MapSocket) {


    // Astronaut player
    function Player(playerObject, position, container) {
        MovingObject.call(this, position, container);
        var self = this;

        this.graphics = new PIXI.Graphics();
        this.updateInfo(playerObject);

        this.speedModifier = 3.5;

        var hitArea = new PIXI.Rectangle(-11, -14, 24, 38);
        this.initSprite("/static/images/nasa_astronaut.png", hitArea);

        this.sprite.on('mousedown', function() {
            self.onDown();
        });
        this.sprite.on('touchstart', function() {
            self.onDown();
        });

        var nameplate = new PIXI.Text(this.name.toLowerCase(), {font : '12px Arial', fill : 0xffffff, align : 'center'});
        nameplate.x = -10;
        nameplate.y = 25;
        this.sprite.addChild(nameplate);

        this.sprite.addChild(this.graphics);

        this.messageText = new PIXI.Text("", {font : '12px Arial', fill : 0xFFFFFF, align : 'left'});
        this.messageText.x = -10;
        this.messageText.y = -30;
        this.sprite.addChild(this.messageText);

        this.message = "";
        this.messageUpTime = 100;
        this.messageTimer = 0;
    }

    Player.prototype = Object.create(MovingObject.prototype);
    Player.prototype.constructor = Player;

    // Overrides

    Player.prototype.update = function(deltaTime) {
        this.velocity.x = this.currentInput.x * this.speedModifier;
        this.velocity.y = -this.currentInput.y * this.speedModifier;

        if (this.colliding && this.collisionVector != null) {
            this.velocity.x = this.collisionVector.x;
            this.velocity.y = this.collisionVector.y;

        }

        MovingObject.prototype.update.call(this, deltaTime);

        if (this.position.x > this.container.width ||
            this.position.x < 0 ||
            this.position.y > this.container.height ||
            this.position.y < 0) {


            this.position = new Vector2(Math.random() * this.container.width, Math.random() * this.container.height);
            this.velocity = new Vector2(0, 0);
        }

        if (this.message != "") {
            this.messageText.text = this.message;

            this.messageTimer = this.messageUpTime;
            this.message = "";
        }

        if (this.messageTimer > 0) 
            this.messageTimer -= deltaTime;
    }

    Player.prototype.getCollisionArea = function() {
        return new PIXI.Rectangle(
            this.position.x + this.sprite.hitArea.x,
            this.position.y + this.sprite.hitArea.y,
            this.sprite.hitArea.width,
            this.sprite.hitArea.height
        );
    }

    Player.prototype.getCollisionVector = function(incomingPoint, incomingVector) {
        var mypos = new Vector2(this.position.x, this.position.y);
        var otherpos = new Vector2(incomingPoint.x, incomingPoint.y);

        return otherpos.sub(mypos).normalize();
    }


    Player.prototype.draw = function() {

        this.graphics.clear();
        if (this.team == "red")
            this.graphics.lineStyle(1, 0xFF0000, 1);
        else 
            this.graphics.lineStyle(1, 0x0000FF, 1);

        this.graphics.drawRect(
            this.sprite.hitArea.x, 
            this.sprite.hitArea.y, 
            this.sprite.hitArea.width, 
            this.sprite.hitArea.height
        );
        
        this.messageText.visible = (this.messageTimer > 0);

        this.sprite.position = new PIXI.Point(this.position.x, this.position.y);
    }

    // Private Functions

    Player.prototype.updateInfo = function(updatedPlayer) {
        this.last_updated = updatedPlayer.last_updated;

        this.currentInput = updatedPlayer.currentInput ? 
            this.sanitizeInput(updatedPlayer.currentInput) : 
            {'x' : 0, 'y' : 0};

        this.name = updatedPlayer.name;
        this.id = updatedPlayer.id;

        if (updatedPlayer.message != "") {
            this.message = updatedPlayer.message;

            var tosend = angular.toJson({'name' : this.name});
            MapSocket.emit("ack_message", tosend);
        }

        if (updatedPlayer.isSabotaging) {
            var tosend = angular.toJson({'room': "ENGINES", 'name' : this.name});
            MapSocket.emit("ack_sabotage", tosend);
        }
        

        this.team = updatedPlayer.team;
        this.room = "soccer";
    }

    Player.prototype.onDown = function() {
        console.log('updating player room');
        var tosend = angular.toJson({'name' : this.name, 'room' : "ENGINES"});
        MapSocket.emit("update_player_room", tosend);
        MapSocket.emit("switch_faction", angular.toJson({'name' : this.name}));
    }

    Player.prototype.sanitizeInput = function (input) {
        return {
            x : Math.floor(input.x * 100) / 100,
            y : Math.floor(input.y * 100) / 100
        };

    }


    return Player;
});