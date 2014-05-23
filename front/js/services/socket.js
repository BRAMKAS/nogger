'use strict';

app.factory('socket', function (dataStore) { // jshint ignore:line
    var socket = io.connect();
    var connected = false;
    var timeout;

    console.log('connecting');
    socket.on('connect', function () {
        console.log('connected');
        connected = true;
        socket.emit('auth', '1qay', function (res) {
            console.log(res);
            socket.emit('getMetrics', function (res) {
                console.log(res);
                if (!res.err) {
                    dataStore.setMetrics(res.data);
                }
            });

            socket.emit('getLogNames', function(res){
                console.log('got getLogNames from server', res);
                if(!res.err){
                    dataStore.setLogNames(res.data);
                }
            });
            clearTimeout(timeout);
            ping();
        })
    });

    socket.on('disconnect', function () {
        console.log('disconnected');
        connected = false;
    });

    socket.on('newLog', function(data){
        dataStore.addLog(data);
    });

    function ping() {
        if (connected) {
            socket.emit('ping', function (res) {
                console.log('ping', res);
                if (!res.err) {
                    dataStore.setHealth(res.data);
                }
                timeout = setTimeout(ping, 10 * 1000);
            })
        }
    }

    return socket;
});