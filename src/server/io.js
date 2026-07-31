__io.on('connection', function(socket){
    __log(`new connection to server: ${socket.id}`);

    socket.on('disconnect', function(){
        __log(`socket disconnected: ${socket.id}`);
    });
});
