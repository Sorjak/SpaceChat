app.factory('PlayerSocket', function ($rootScope, $interval, $q) {

    function PlayerSocket() {
        this.socket = io('/player');
    }

    PlayerSocket.prototype.register = function(playername) {
        var self = this;
        return $q(function(resolve, reject) {
            self.emit('register_new_player', playername, function(result) {
                if (result) {
                    resolve(result);
                } else {
                    reject(false);
                }
            });
        });
    }

    PlayerSocket.prototype.connect = function(username, key) {
        var self = this;

        var playerInfo = {'username' : username, 'key' : key}
        return $q(function(resolve, reject) {
            self.emit('player_connected', playerInfo, function(result) {
                if (result) {
                    console.log("connected as: " + playerInfo.username);
                    resolve(result);
                } else {
                    reject(false);
                }
            });
        });
    }
    PlayerSocket.prototype.on = function (eventName, callback) {
        this.socket.on(eventName, function () {  
            var args = arguments;
            $rootScope.$apply(function () {
                callback.apply(this.socket, args);
            });
        });
    }
    PlayerSocket.prototype.emit = function (eventName, data, callback) {
        this.socket.emit(eventName, data, function () {
            var args = arguments;
            $rootScope.$apply(function () {
                if (callback) {
                    callback.apply(this.socket, args);
                }
            });
        })
    },
    PlayerSocket.prototype.disconnect =function() {
        this.socket.disconnect();
    }
    PlayerSocket.prototype.isConnected = function() {
        return this.socket.connected;
    }

    return PlayerSocket;
})

.factory('ControlArea', function(PlayerSocket, Vector2) {

    function ControlArea(container, position, size) {

        this.thumb_circle_radius = 40;

        this.container = container;
        this.sprite = null;
        this.holding = false;
        this.thumb_circle = null;
        this.bounding_circle = null;
        this.input = new PIXI.Point(0, 0);

        this.initSprite(position, size);
        
        this.bindListeners(this);

        this.container.addChild(this.sprite);
        this.container.addChild(this.thumb_circle);
        
    };

    ControlArea.prototype.initSprite = function(position, size) {
        this.sprite = new PIXI.Sprite.fromImage("/static/images/joystick_orange_bg.png");

        this.sprite.width = size.x;
        this.sprite.height = size.y;

        var realCenter = new PIXI.Point((this.container.width / 2), (this.container.height / 2));

        this.sprite.position = realCenter;
        this.sprite.interactive = true;
        this.sprite.anchor = new PIXI.Point(.5, .5);

        this.bounding_circle = new PIXI.Circle(realCenter.x, realCenter.y, this.sprite.width / 2);
        // this.sprite.hitArea = circle;

        this.thumb_circle = new PIXI.Graphics();
        this.thumb_circle.lineStyle(2, 0xFFFFFF);
        this.thumb_circle.drawCircle(realCenter.x, realCenter.y, this.thumb_circle_radius);
        this.thumb_circle.visible = false;

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
        this.thumb_circle.visible = true;
        // this.processInput(mouseData.data.getLocalPosition(this.sprite));
        this.processInput(mouseData.data.global);
    }

    ControlArea.prototype.onUp = function(mouseData) {
        this.holding = false;
        this.input = new PIXI.Point(0, 0);
        this.resetThumbCircle();
    }

    ControlArea.prototype.onMove = function(mouseData) {
        if (this.holding){
            // this.processInput(mouseData.data.getLocalPosition(this.sprite));
            this.processInput(mouseData.data.global);
        }
    }

    ControlArea.prototype.processInput = function(rawPosition) {
        this.updateThumbCircle(rawPosition);
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

    ControlArea.prototype.updateThumbCircle = function(rawPosition) {
        var localX = rawPosition.x - this.sprite.position.x;
        var localY = rawPosition.y - this.sprite.position.y;
        var localPos = new Vector2(localX, localY);

        var normalPos = localPos.clone().normalize();
        var maxPos = normalPos.multiplyScalar(this.bounding_circle.radius - this.thumb_circle_radius);

        if (localPos.length() > maxPos.length()) {
            this.thumb_circle.position = new PIXI.Point(maxPos.x, maxPos.y);
        } else {
            this.thumb_circle.position = new PIXI.Point(localPos.x, localPos.y);
        }


    }

    ControlArea.prototype.resetThumbCircle = function() {
        this.thumb_circle.position.x = 0;
        this.thumb_circle.position.y = 0;
        this.thumb_circle.visible = false;
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

;