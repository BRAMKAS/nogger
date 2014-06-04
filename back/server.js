'use strict';
var express = require('express.io');
var path = require('path');
var password = require('./password');
var config = require("../config.json");
var metrics = require('./metrics');
var logs = require('./logs');
var publish = require('./publish');

var app = express();

var pjson = require("../package.json");
var port = 7076;

var clients = [];
var wrongAttempts = {};

app.use(express.cookieParser());
if (config.prod) {
    app.use(express.static(path.join(__dirname, '../front-build')));
} else {
    app.use(express.static(path.join(__dirname, '../front')));
}
app.http().io();

app.io.configure(function () {
    app.io.enable('browser client minification');  // send minified client
    //app.io.set('log level', 1);                    // reduce logging
});

app.io.route('auth', function (req) {
    var ip = req.io.socket.handshake.address.address;
    console.log('auth, ip:', ip);
    if (!wrongAttempts[ip] || wrongAttempts[ip] < 10) {
        password.match(req.data, function (success) {
            if (success) {
                delete wrongAttempts[ip];
                clients.push(req.io.socket.id);
                if (clients.length === 1) {
                    publish.connected();
                }
                req.io.respond({err: null, data: pjson.version});
            } else {
                if (!wrongAttempts[ip]) {
                    wrongAttempts[ip] = 0;
                }
                wrongAttempts[ip]++;
                req.io.respond({err: "wrong pw", data: null});
            }
        });
    } else {
        req.io.respond({err: "blocked", data: null});
    }
});

app.io.route('getMetrics', function (req) {
    if (checkAuth(req)) {
        metrics.getMetrics(function (err, data) {
            req.io.respond({err: err, data: data});
        })
    } else {
        req.io.respond({err: "not authenticated", data: null});
    }
});

app.io.route('getLogNames', function(req){
    if (checkAuth(req)) {
        logs.getLogNames(function (err, data) {
            req.io.respond({err: err, data: data});
        })
    } else {
        req.io.respond({err: "not authenticated", data: null});
    }
});

app.io.route('getLogFile', function(req){
    if (checkAuth(req)) {
        logs.getLogs(req.data.name, req.data.offset || 0, function (err, data) {
            req.io.respond({err: err, data: data});
        })
    } else {
        req.io.respond({err: "not authenticated", data: null});
    }
});

app.io.route('ping', function (req) {
    if (checkAuth(req)) {
        var done = false;
        publish.ping(function (t, adapter) {
            if (!done) {
                done = true;
                req.io.respond({err: null, data: {t: t, adapter: adapter}});
            }
        });
        setTimeout(function () {
            if (!done) {
                done = true;
                req.io.respond({err: null, data: {t: null}});
            }
        }, 5000);
    } else {
        req.io.respond({err: "not authenticated", data: null});
    }
});

app.io.route('disconnect', function (req) {
    var index = clients.indexOf(req.io.socket.id);
    if (index !== -1) {
        clients.splice(index, 1);
    }
    if (clients.length === 0) {
        publish.disconnected();
    }
});


app.get('*', function (req, res) {
    res.sendfile(path.join(__dirname, '../front/index.html'));
});

app.listen(port);
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log('server running on ' + add + ':' + port);
});

publish.onLog(function(message){
    broadcast('newLog', message);
});

function checkAuth(req) {
    return clients.indexOf(req.io.socket.id) !== -1
}

function broadcast(fn, msg) {
    for (var i in clients) {
        app.io.sockets.socket(clients[i]).emit(fn, msg);
    }
}
