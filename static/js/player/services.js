app.factory('SocketService', function ($rootScope) {
    var socket = io('/player');
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {  
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
})

.factory('ControlArea', function() {

    function ControlArea(container, position, size) {

        this.container = container;
        this.sprite = null;
        this.holding = false;
        this.border = null;
        this.input = new PIXI.Point(0, 0);

        this.initSprite(position, size);
        
        this.bindListeners(this);

        this.container.addChild(this.sprite);
        this.container.addChild(this.border);
    };

    ControlArea.prototype.initSprite = function(position, size) {
        this.sprite = new PIXI.Sprite.fromImage("/static/images/compass_rose.png");

        this.sprite.width = size.x;
        this.sprite.height = size.y;

        var realCenter = new PIXI.Point((this.container.width / 2), (this.sprite.height / 2));

        this.sprite.position = realCenter;
        this.sprite.interactive = true;
        this.sprite.anchor = new PIXI.Point(.5, .5);

        var circle = new PIXI.Circle(realCenter.x, realCenter.y, (this.sprite.width / 2) - 40);
        // console.log(circle.x + " " + circle.y + " " + circle.radius);
        // this.sprite.hitArea = circle;

        this.border = new PIXI.Graphics();
        this.border.lineStyle(3, 0xFF0000);
        // this.border.drawCircle(this.sprite.hitArea.x, this.sprite.hitArea.y, this.sprite.hitArea.radius);


        // this.sprite.hitArea = new PIXI.Circle(realCenter.x, realCenter.y, 40);
    }

    ControlArea.prototype.bindListeners = function(self) {
        // It's necessary to differentiate between 'this' and 'self' here, due to JS closures and variable scope.
        this.sprite.on('mousedown', function(mouseData) {
            self.onDown(mouseData);
        });

        this.sprite.on('touchstart', function(mouseData) {
            self.onDown(mouseData);
        });

        this.sprite.on('mouseup', function(mouseData) {
            self.onUp(mouseData);
        });

        this.sprite.on('touchend', function(mouseData) {
            self.onUp(mouseData);
        });

        this.sprite.on('mouseupoutside', function(mouseData) {
            self.onUp(mouseData);
        });

        this.sprite.on('touchendoutside', function(mouseData) {
            self.onUp(mouseData);
        });

        this.sprite.on('mousemove', function(mouseData) {
            self.onMove(mouseData);
        });

        this.sprite.on('touchmove', function(mouseData) {
            self.onMove(mouseData);
        });
    }

    ControlArea.prototype.onDown = function(mouseData) {
        this.holding = true;
        // this.processInput(mouseData.data.getLocalPosition(this.sprite));
        this.processInput(mouseData.data.global);
    }

    ControlArea.prototype.onUp = function(mouseData) {
        this.holding = false;
        this.input = new PIXI.Point(0, 0);
    }

    ControlArea.prototype.onMove = function(mouseData) {
        if (this.holding){
            // this.processInput(mouseData.data.getLocalPosition(this.sprite));
            this.processInput(mouseData.data.global);
        }
    }

    ControlArea.prototype.processInput = function(rawPosition) {
        var deltaX = (this.sprite.position.x - rawPosition.x) * -1;
        var deltaY = (this.sprite.position.y - rawPosition.y);

        var ratioX = deltaX / (this.sprite.width / 2);
        var ratioY = deltaY / (this.sprite.height / 2);

        var cappedX = Math.min(ratioX , 1);
        cappedX = Math.max(cappedX, -1);

        var cappedY = Math.min(ratioY , 1);
        cappedY = Math.max(cappedY, -1);

        var vec = new PIXI.Point(
            cappedX,
            cappedY
        );
        this.input = vec;
    }

    ControlArea.prototype.update = function(deltaTime) {
    }

    return ControlArea;
})

.factory('Player', function() {
    function Player(name) {
        this.name = name;
        this.room = "";
        this.message = "";

        this.isTraitor = false;
    }

    return Player;
})