
define(function() {
    /*
     * @class Vector2
     * @constructor 
     * @param x {Number} position of the point
     * @param y {Number} position of the point
     */
    Vector2 = function(x, y)
    {
        /**
         * @property x 
         * @type Number
         * @default 0
         */
        this.x = x || 0;

        /**
         * @property y
         * @type Number
         * @default 0
         */
        this.y = y || 0;
    };

    /**
     * Creates a clone of this point
     *
     * @method clone
     * @return {Vector2} a copy of the point
     */
    Vector2.prototype.clone = function()
    {
        return new Vector2(this.x, this.y);
    };

    Vector2.prototype.add = function(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    };

    Vector2.prototype.sub = function(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    };

    Vector2.prototype.invert = function() {
        this.x *= -1;
        this.y *= -1;
        return this;
    };

    Vector2.prototype.multiplyScalar = function(s) {
        this.x *= s;
        this.y *= s;
        return this;
    };

    Vector2.prototype.divideScalar = function(s) {
        if(s === 0) {
            this.x = 0;
            this.y = 0;
        } else {
            var invScalar = 1 / s;
            this.x *= invScalar;
            this.y *= invScalar;
        }
        return this;
    };

    Vector2.prototype.dot = function(v) {
        return this.x * v.x + this.y * v.y;
    };

    Vector2.prototype.length = function(v) {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    Vector2.prototype.lengthSq = function() {
        return this.x * this.x + this.y * this.y;
    };

    Vector2.prototype.normalize = function() {
        return this.divideScalar(this.length());
    };

    Vector2.prototype.distanceTo = function(v) {
        return Math.sqrt(this.distanceToSq(v));
    };

    Vector2.prototype.distanceToSq = function(v) {
        var dx = this.x - v.x, dy = this.y - v.y;
        return dx * dx + dy * dy;
    };

    Vector2.prototype.set = function(x, y) {
        this.x = x;
        this.y = y;
        return this;
    };

    Vector2.prototype.setX = function(x) {
        this.x = x;
        return this;
    };

    Vector2.prototype.setY = function(y) {
        this.y = y;
        return this;
    };

    Vector2.prototype.setLength = function(l) {
        var oldLength = this.length();
        if(oldLength !== 0 && l !== oldLength) {
            this.multiplyScalar(l / oldLength);
        }
        return this;
    };

    Vector2.prototype.invert = function(v) {
        this.x *= -1;
        this.y *= -1;
        return this;
    };

    Vector2.prototype.lerp = function(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        return this;
    };

    Vector2.prototype.rad = function() {
        return Math.atan2(this.x, this.y);
    };

    Vector2.prototype.deg = function() {
        return this.rad() * 180 / Math.PI;
    };

    Vector2.prototype.equals = function(v) {
        return this.x === v.x && this.y === v.y;
    };

    Vector2.prototype.rotate = function(theta) {
        var xtemp = this.x;
        this.x = this.x * Math.cos(theta) - this.y * Math.sin(theta);
        this.y = xtemp * Math.sin(theta) + this.y * Math.cos(theta);
        return this;
    };

    // constructor
    Vector2.prototype.constructor = Vector2;

    return Vector2;

});