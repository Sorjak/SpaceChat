__io.on('connection', function(socket){
    console.log('new connection to server');

    socket.on('disconnect', function(){
        console.log('socket disconnected');
    });
});


