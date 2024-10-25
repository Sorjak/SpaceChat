__io.on('connection', function(socket){
    console.log(`new player connection to server: ${socket.id}`);

    socket.on('disconnect', function(){
        console.log(`player socket disconnected: ${socket.id}`);
    });
});

__mapio.on('connection', function(socket){
    console.log(`new map connection to server: ${socket.id}`);

    socket.on('disconnect', function(){
        console.log(`map socket disconnected: ${socket.id}`);
    });
});
