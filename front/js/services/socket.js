'use strict';

app.factory('socket', function () { // jshint ignore:line
    var socket = io.connect();
    var connected = false;

    socket.on('connect', function(){
        console.log('connected');
        connected = true;
        socket.emit('auth', '1qay', function(res){
           console.log(res);
        })
    });

    socket.on('disconnect', function(){
        console.log('disconnected');
        connected = false;
    });

    return socket;
});