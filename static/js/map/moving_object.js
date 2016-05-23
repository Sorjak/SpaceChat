app.factory('CollisionObject', function(Vector2) {

    function CollisionObject(pos, container) {
        this.position = new Vector2(pos.x, pos.y);
        this.container = container;
        this.sprite = null;

        this.colliding = false;
        this.collider = null;

    }

    CollisionObject.prototype.initSprite = function(path, hitArea) {
        this.sprite = new PIXI.Sprite.fromImage(path);
        this.sprite.position = new PIXI.Point(this.position.x, this.position.y);
        this.sprite.interactive = true;
        this.sprite.anchor = new PIXI.Point(.5, .5);

        this.sprite.hitArea = hitArea;

        this.container.addChild(this.sprite);
    }

    CollisionObject.prototype.update = function(deltaTime) {
        if (this.colliding) {
            var collisionVector = this.collider.getCollisionVector(this.position, this.velocity);

            this.onCollide(collisionVector);
        }

    }

    CollisionObject.prototype.onCollide = function(collisionVector) {

    }

    CollisionObject.prototype.checkCollisions = function(potentials) {
        var self = this;
        self.colliding = false;
        self.collider = null;

        for (var i = potentials.length - 1; i >= 0; i--) {
            var other = potentials[i];

            self.colliding = self.collidesWith(other);
            if (self.colliding)  {
                self.collider = other;
                break;
            }
        }
    }

    CollisionObject.prototype.getCollisionArea = function(incomingPoint, incomingVector) {

    }

    CollisionObject.prototype.getCollisionVector = function() {

    }

    CollisionObject.prototype.collidesWith = function(other) {
        var myRect = this.getCollisionArea();
        var otherRect = other.getCollisionArea();

        return !(otherRect.x > (myRect.x + myRect.width) || 

           (otherRect.x + otherRect.width) < myRect.x || 

           otherRect.y > (myRect.y + myRect.height) ||

           (otherRect.y + otherRect.height) < myRect.y);
    }

    return CollisionObject;

})

.factory('MovingObject', function(Vector2, CollisionObject) {
    
    function MovingObject(pos, container) {
        CollisionObject.call(this, pos, container);

        this.velocity = new Vector2();
        this.collisionVector = null;
    }

    MovingObject.prototype = Object.create(CollisionObject.prototype);
    MovingObject.prototype.constructor = MovingObject;

    MovingObject.prototype.update = function(deltaTime) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        if (!this.colliding && this.collisionVector != null) {
            this.collisionVector = null;
        }

        CollisionObject.prototype.update.call(this, deltaTime);
    }

    MovingObject.prototype.onCollide = function(collisionVector) {
        this.collisionVector = collisionVector;

        CollisionObject.prototype.onCollide.call(this, collisionVector);
    }


    return MovingObject; 
})

.factory('StaticObject', function(CollisionObject) {
    function StaticObject(pos, container) {
        CollisionObject.call(this, pos, container);
    }

    StaticObject.prototype = Object.create(CollisionObject.prototype);
    StaticObject.prototype.constructor = StaticObject;

    StaticObject.prototype.onCollide = function(collisionVector) {

        CollisionObject.prototype.onCollide.call(this, collisionVector);
    }

    return StaticObject;
})

;