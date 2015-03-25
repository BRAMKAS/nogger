'use strict';
var fs = require('fs');
var express = require('express.io');
var path = require('path');
var app = express();
var argv = require('minimist')(process.argv.slice(2));
var _ = require('underscore');
var Tail = require('tail').Tail;

var pkg = require('./../package');
var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var noggerDir = '.nogger';
var settingsPath = path.resolve(home, noggerDir, 'settings.json');

var id = argv._[0];
var prevBlockedList = [];

var settings = readSettings();
var instance = getInstance();


if (!instance) {
    console.log('id not found');
    process.exit();
    return;
}


var clients = [];
var wrongAttempts = {};

app.use(express.cookieParser());

var prod = false;
if (prod) {
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
    console.log('auth, ip:', ip, 'pw', req.data, instance.pw);
    console.log('blockedList', settings.blockedList);

    if (settings.blockedList.indexOf(ip) !== -1) {
        req.io.respond({
            err: "Too many wrong attempts! You are blocked from the server. To unblock go to your terminal and type: >> nogger unblock " + ip,
            data: null
        });
        return;
    }

    if (req.data === instance.pw) {
        delete wrongAttempts[ip];
        clients.push(req.io.socket.id);
        // TODO: tail watch
        req.io.respond({err: null, data: pkg.version});
    } else {
        if (!wrongAttempts[ip]) {
            wrongAttempts[ip] = 0;
        }
        wrongAttempts[ip]++;
        if (wrongAttempts[ip] > 10) {
            if (settings.blockedList.indexOf(ip) === -1) {
                settings.blockedList.push(ip);
                updateBlockedList();
            }
        }
        req.io.respond({err: "wrong pw", data: null});
    }
});

app.io.route('getFileNames', function (req) {
    if (checkAuth(req)) {
        var dir = path.dirname(instance.path);
        console.log(dir);
        fs.readdir(dir, function(err, files){
            if(err){
                req.io.respond({err: err, data: null});
                return;
            }
            req.io.respond({err: null, data: files});
        })
    } else {
        req.io.respond({err: "not authenticated", data: null});
    }
});

app.io.route('getFile', function (req) {
    if (checkAuth(req)) {
        req.io.respond({err: "not implemented", data: null});
    } else {
        req.io.respond({err: "not authenticated", data: null});
    }
});


app.io.route('disconnect', function (req) {
    var index = clients.indexOf(req.io.socket.id);
    if (index !== -1) {
        clients.splice(index, 1);
    }
    // TODO:  tail.unwatch
});


app.get('*', function (req, res) {
    res.sendfile(path.join(__dirname, '../front/index.html'));
});

app.get('/test', function (req, res) {
    res.send(200, instance);
});


app.listen(instance.port);
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log('server running on ' + add + ':' + instance.port);
});


function checkAuth(req) {
    return clients.indexOf(req.io.socket.id) !== -1
}

function broadcast(fn, msg) {
    for (var i in clients) {
        app.io.sockets.socket(clients[i]).emit(fn, msg);
    }
}

function readSettings() {
    return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
}

function getInstance() {
    var instance;
    settings.instances.some(function (i) {
        if (i.id === id) {
            instance = i;
            return true;
        }
    });
    return instance;
}

function updateBlockedList() {
    var s = readSettings();
    s.blockedList = _.union(settings.blockedList, s.blockedList);
    settings.blockedList = s.blockedList;
    fs.writeFile(settingsPath, JSON.stringify(s, null, 4), function (err) {
        if (err) {
            console.log('error saving settings file', err);
        }
    });
}




