'use strict';

app.factory('socket', function (dataStore, $location, $rootScope) { // jshint ignore:line
    var socket = io.connect();
    var connected = false;
    var timeout;

    socket.login = function(pw, save, callback){
        callback = callback || function(){};
        socket.emit('auth', pw, function (res) {
            console.log('response', res);
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
                        $rootScope.authenticated = true;
                        $rootScope.$apply();
                        if(save){
                            localStorage.setItem('p', pw);
                        }
                        sessionStorage.setItem('p', pw);
                    });
                });
                clearTimeout(timeout);
                ping();
            } else {
                if(res.err !== 'wrong pw'){
                    alert(res.err);
                }
                callback();
                $rootScope.authenticated = false;
                $rootScope.$apply();
                localStorage.removeItem('p');
                sessionStorage.removeItem('p');

            }
        })
    };

    socket.on('connect', function () {
        var pw = sessionStorage.getItem('p') || localStorage.getItem('p');
        connected = true;
        if(pw){
            socket.login(pw);
        } else {
            $rootScope.authenticated = false;
            $rootScope.$apply();
        }
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