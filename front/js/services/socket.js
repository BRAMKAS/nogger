'use strict';

app.factory('socket', function (dataStore) { // jshint ignore:line
    var socket = io.connect();
    var connected = false;
    var timeout;

    socket.on('connect', function () {
        console.log('connected');
        connected = true;
        socket.emit('auth', '1qay', function (res) {
            if (!res.err) {
                socket.emit('getLogNames', function (res) {
                    if (!res.err) {
                        dataStore.setLogNames(res.data);
                    }

                    socket.emit('getMetrics', function (res) {
                        if (!res.err) {
                            console.log('metrics', res.data);
                            dataStore.setMetrics(res.data);
                        }
                        $(document).trigger('auth');
                        socket.auth = true;
                    });
                });
                clearTimeout(timeout);
                ping();
            } else {
                console.error(res);
            }
        })
    });

    socket.on('disconnect', function () {
        console.log('disconnected');
        connected = false;
    });

    socket.on('newLog', function (data) {
        dataStore.addLog(data);
    });

    function ping() {
        if (connected) {
            socket.emit('ping', function (res) {
                if (!res.err) {
                    dataStore.setHealth(res.data);
                }
                timeout = setTimeout(ping, 10 * 1000);
            })
        }
    }

    return socket;
});