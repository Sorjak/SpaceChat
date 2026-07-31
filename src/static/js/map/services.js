app.factory('MapSocket', function ($rootScope) {
    var map_url = document.getElementById('map_url');
    console.log(`Connecting to game server at ${map_url.innerText}`);
    var socket = io(map_url.innerText);
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
        },
        disconnect: function() {
            socket.disconnect();
        }
    };
})



