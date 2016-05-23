app.factory('Wall', function(StaticObject) {

    function Wall(container, pos, dimensions) {
        StaticObject.call(this, pos, container);

        this.name = "WallObject";
        this.dimensions = dimensions;

        this.graphics = new PIXI.Graphics();

        this.container.addChild(this.graphics);
    }

    Wall.prototype = Object.create(StaticObject.prototype);
    Wall.prototype.constructor = Wall;

    Wall.prototype.initSprite = function(path, hitArea) {
        this.sprite = new PIXI.Sprite.fromImage(path);
        this.sprite.position = new PIXI.Point(
            this.position.x + (this.dimensions.x / 2), 
            this.position.y + (this.dimensions.y / 2) 
        );
        this.sprite.width = this.dimensions.x;
        this.sprite.height = this.dimensions.y;
        this.sprite.interactive = true;
        this.sprite.anchor = new PIXI.Point(.5, .5);

        this.sprite.hitArea = hitArea;

        this.container.addChild(this.sprite);
    }

    Wall.prototype.getCollisionArea = function() {
        return new PIXI.Rectangle(
            this.position.x,
            this.position.y,
            this.dimensions.x,
            this.dimensions.y
        );
    }

    Wall.prototype.getCollisionVector = function(incomingPoint, incomingVector) {
        var otherpos = new Vector2(incomingPoint.x, incomingPoint.y);
        var mypos = this.getNearestPoint(otherpos);
        
        var away = otherpos.sub(mypos).normalize();
        
        return this.snapToClosestAxis(away);
    }

    Wall.prototype.draw = function() {
        // this.graphics.clear();
        // this.graphics.lineStyle(1, 0xFF0000, 1);
        // this.graphics.drawRect(
        //     this.position.x,
        //     this.position.y,
        //     this.dimensions.x,
        //     this.dimensions.y
        // );
    }

    Wall.prototype.snapToClosestAxis = function(vector) {
        var axes = [new Vector2(0, 1), new Vector2(1, 0), new Vector2(0, -1), new Vector2(-1, 0)];
        var max = -1;
        var output = null;

        angular.forEach(axes, function(axis) {
            var dot = vector.dot(axis);
            if (dot > max && dot > 0) {
                max = dot;
                output = axis;
            }
        });
        return output;
    }

    Wall.prototype.getNearestPoint = function(incomingPoint) {
        var bounds = this.getCollisionArea();
        var left = bounds.x;
        var right = bounds.x + bounds.width;
        var top = bounds.y;
        var bottom = bounds.y + bounds.height;

        var x = incomingPoint.x; var y = incomingPoint.y;

        var dl = Math.abs(x - left);
        var dr = Math.abs(x - right);
        var dt = Math.abs(y - top);
        var db = Math.abs(y - bottom);
        var m = Math.min(dl, dr, dt, db);

        if (m == dt) return new Vector2(x, top);
        if (m == db) return new Vector2(x, bottom);
        if (m == dl) return new Vector2(left, y);
        return new Vector2(right, y);
    }

    return Wall;
})

app.factory('Goal', function(StaticObject) {

    function Goal(container, pos, dimensions, team) {
        StaticObject.call(this, pos, container);

        this.name = "WallObject";
        this.dimensions = dimensions;
        this.team = team;
        this.score = 0;

        this.graphics = new PIXI.Graphics();

        this.container.addChild(this.graphics);
    }

    Goal.prototype = Object.create(StaticObject.prototype);
    Goal.prototype.constructor = Goal;

    Goal.prototype.initSprite = function(path, hitArea) {
        this.sprite = new PIXI.Sprite.fromImage(path);
        this.sprite.position = new PIXI.Point(
            this.position.x + (this.dimensions.x / 2), 
            this.position.y + (this.dimensions.y / 2) 
        );
        this.sprite.width = this.dimensions.x;
        this.sprite.height = this.dimensions.y;
        this.sprite.interactive = true;
        this.sprite.anchor = new PIXI.Point(.5, .5);

        this.sprite.hitArea = hitArea;

        this.container.addChild(this.sprite);
    }

    Goal.prototype.getCollisionArea = function() {
        return new PIXI.Rectangle(
            this.position.x,
            this.position.y,
            this.dimensions.x,
            this.dimensions.y
        );
    }

    Goal.prototype.onCollide = function(collisionVector) {
        if (this.collider.name == "BallObject"){
            this.score++;
            this.collider.reset()
            console.log("ball entered");
        }

        StaticObject.prototype.onCollide.call(this, collisionVector);
    }


    Goal.prototype.getCollisionVector = function(incomingPoint, incomingVector) {
        if (this.collider != null) {
            if (this.collider.name == "BallObject"){
                return new Vector2(0, 0);
            } else 
                return incomingVector;
        }
    }

    Goal.prototype.draw = function() {
        this.graphics.clear();
        // this.graphics.lineStyle(1, 0xFF0000, 1);
        if (this.team == "red")
            this.graphics.beginFill(0xFF0000, .7);
        else 
            this.graphics.beginFill(0x0000FF, .7);
        this.graphics.drawRect(
            this.position.x,
            this.position.y,
            this.dimensions.x,
            this.dimensions.y
        );
        this.graphics.endFill();
    }

    return Goal;
});