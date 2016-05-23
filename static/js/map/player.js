app.factory('Player', function (MovingObject) {


    // Astronaut player
    function Player(playerObject, position, container) {
        MovingObject.call(this, position, container);
        var self = this;

        this.graphics = new PIXI.Graphics();
        this.updateInfo(playerObject);

        this.speedModifier = 2;

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

        this.messageText = new PIXI.Text(this.message, {font : '12px Arial', fill : 0xFFFFFF, align : 'left'});
        this.sprite.addChild(this.messageText);
    }

    Player.prototype = Object.create(MovingObject.prototype);
    Player.prototype.constructor = Player;

    // Overrides

    Player.prototype.update = function(deltaTime) {
        this.velocity.x = this.currentInput.x * deltaTime * this.speedModifier;
        this.velocity.y = -this.currentInput.y * deltaTime * this.speedModifier;

        if (this.colliding && this.collisionVector != null) {
            this.velocity.x = this.collisionVector.x * deltaTime;
            this.velocity.y = this.collisionVector.y * deltaTime;

        }

        MovingObject.prototype.update.call(this, deltaTime);
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
        
        if (this.message != "") {
            this.sprite.removeChild(this.messageText);
            this.messageText = new PIXI.Text(this.message, {font : '12px Arial', fill : 0xFFFFFF, align : 'left'});
            // this.messageText.text = this.message;
            this.messageText.x = -10;
            this.messageText.y = -30;

            
            this.graphics.lineStyle(0, 0x000000, 1);
            this.graphics.beginFill(0x000000, 1);
            this.graphics.drawRect(
                this.messageText.x,
                this.messageText.y, 
                Math.max(this.messageText.width, 20), 
                this.messageText.height
            );
            this.graphics.endFill();
        }

        this.sprite.addChild(this.graphics);
        
        this.sprite.addChild(this.messageText);

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

        this.message = updatedPlayer.message;

        this.team = updatedPlayer.team;
    }

    Player.prototype.onDown = function() {
        console.log(this);
    }

    Player.prototype.sanitizeInput = function (input) {
        return {
            x : Math.floor(input.x * 100) / 100,
            y : Math.floor(input.y * 100) / 100
        };

    }


    return Player;
});