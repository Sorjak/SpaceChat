app.factory('Ball', function(MovingObject) {
    function Ball(pos, container) {
        MovingObject.call(this, pos, container);

        this.name = "BallObject";
        this.graphics = new PIXI.Graphics();

        var hitArea = new PIXI.Rectangle(-24, -24, 48, 48);
        this.initSprite("/static/images/soccer_ball.png", hitArea);

        this.sprite.addChild(this.graphics);
    }

    Ball.prototype = Object.create(MovingObject.prototype);
    Ball.prototype.constructor = Ball;

    // Overrides

    Ball.prototype.update = function(deltaTime) {
        if (this.colliding && this.collisionVector != null) {
            this.velocity.add(this.collisionVector);
        }

        var friction = new Vector2(this.velocity.x, this.velocity.y);
        friction.invert();
        friction.multiplyScalar(.008);

        this.velocity.add(friction);

        MovingObject.prototype.update.call(this, deltaTime);

        if (this.position.x > this.container.width ||
            this.position.x < 0 ||
            this.position.y > this.container.height ||
            this.position.y < 0) {

            this.reset();
        }
    }

    Ball.prototype.getCollisionArea = function() {
        return new PIXI.Rectangle(
            this.position.x + this.sprite.hitArea.x,
            this.position.y + this.sprite.hitArea.y,
            this.sprite.hitArea.width,
            this.sprite.hitArea.height
        );
    }

    Ball.prototype.getCollisionVector = function(incomingPoint, incomingVector) {
        var mypos = new Vector2(this.position.x, this.position.y);
        var otherpos = new Vector2(incomingPoint.x, incomingPoint.y);

        return otherpos.sub(mypos).normalize();
    }

    Ball.prototype.draw = function() {
        // this.graphics.clear();
        // this.graphics.lineStyle(1, 0xFF0000, 1);
        // this.graphics.drawRect(
        //     this.sprite.hitArea.x, 
        //     this.sprite.hitArea.y, 
        //     this.sprite.hitArea.width, 
        //     this.sprite.hitArea.height
        // );

        this.sprite.position = new PIXI.Point(this.position.x, this.position.y);
    }

    Ball.prototype.reset = function() {
        this.position = new Vector2(600, 300);
        this.velocity = new Vector2(0, 0);
    }

    return Ball;
})