'use strict';

app.factory('socket', function ($location, $rootScope) { // jshint ignore:line
    var socket = io.connect();
    var connected = false;

    socket.login = function (pw, save, callback) {
        callback = callback || function () {
        };
        socket.emit('auth', pw, function (res) {
            console.log('response', res);
            if (!res.err) {
                $rootScope.instance = res.data.instance;
                $rootScope.otherInstances = res.data.otherInstances;
                $rootScope.version = res.data.version;
                socket.auth = true;
                $rootScope.authenticated = true;
                $rootScope.$apply();
                if (save) {
                    localStorage.setItem('p', pw);
                }
                sessionStorage.setItem('p', pw);
            } else {
                if (res.err !== 'wrong pw') {
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
    setTimeout(function () {
        if (!connected) {
            console.warn('seems like there is a problem connecting to the server');
        }
    }, 5000);
    socket.on('connect', function () {
        var pw = sessionStorage.getItem('p') || localStorage.getItem('p');
        connected = true;
        if (pw) {
            socket.login(pw);
        } else {
            $rootScope.authenticated = false;
            $rootScope.$apply();
        }
    });

    socket.on('disconnect', function (e) {
        connected = false;
        console.log('disconnect', e);
    });


    socket.on('newLog', function (data) {

    });

    socket.on('newMetric', function (data) {

    });


    return socket;
});
