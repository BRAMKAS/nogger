'use strict';
var fs = require('fs');
var express = require('express.io');
var path = require('path');
var app = express();
var argv = require('minimist')(process.argv.slice(2));
var pem = require('pem');
var _ = require('underscore');
var Tail = require('tail').Tail;

var pkg = require('./../package');
var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var noggerDir = '.nogger';
var settingsPath = path.resolve(home, noggerDir, 'settings.json');
var host;

var id = argv._[0];

saveLogs();
var settings = readSettings();
var instance = getInstance();

if (!instance) {
    console.log('id not found');
    process.exit();
    return;
}

console.log('starting server');
var tail = new Tail(instance.path);
tail.unwatch();
tail.on("line", function(data) {
    broadcast('line', data);
});
tail.on("error", function(error) {
    console.log('Tail error: ', error);
});

var clients = [];
var wrongAttempts = {};

app.use(express.cookieParser());

var prod = false;
if (prod) {
    app.use(express.static(path.join(__dirname, '../front-build')));
} else {
    app.use(express.static(path.join(__dirname, '../front')));
}

getCertificate(function (keys) {
    app.https(keys).io();

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
            if(clients.length === 1){
                tail.watch();
            }
            var s = readSettings();
            var running = [];
            s.instances.forEach(function (otherInstance) {
                if (otherInstance.status === "running" && otherInstance.id !== instance.id) {
                    running.push({
                        id: otherInstance.id,
                        path: otherInstance.path,
                        port: otherInstance.port,
                        url: 'https://' + host + ':' + otherInstance.port
                    });
                }
            });

            req.io.respond({
                err: null,
                data: {
                    version: pkg.version,
                    instance: {
                        id: instance.id,
                        path: instance.path,
                        port: instance.port,
                        url: 'https://' + host + ':' + instance.port
                    },
                    otherInstances: running
                }
            });
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

    app.io.route('getLogNames', function (req) {
        if (checkAuth(req)) {
            var s = readSettings();
            var running = [];
            s.instances.forEach(function (instance) {
                if (instance.status === "running") {
                    running.push({
                        id: instance.id,
                        path: instance.path,
                        port: instance.port
                    });
                }
            });
            req.io.respond({err: null, data: running});
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
        if(clients.length == 0){
            tail.unwatch();
        }
    });


    app.get('*', function (req, res) {
        res.sendfile(path.join(__dirname, '../front/index.html'));
    });


    app.listen(instance.port);
    require('dns').lookup(require('os').hostname(), function (err, add, fam) {
        host = add;
        console.log('server running on ' + add + ':' + instance.port);
    });
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

function getCertificate(callback) {
    if (instance.cert && instance.key) {
        fs.readFile(instance.cert, 'utf8', function (err, cert) {
            if (err) {
                console.log(err);
            } else {
                fs.readFile(instance.key, 'utf8', function (err, key) {
                    if (err) {
                        console.log(err);
                    } else {
                        callback({
                            cert: cert,
                            key: key
                        });
                    }
                })
            }
        });
    } else {
        pem.createCertificate({days: 365, selfSigned: true}, function (err, keys) {
            if (err) {
                console.log("error creating cert", err);
            } else {
                callback({
                    key: keys.serviceKey,
                    cert: keys.certificate
                });
            }
        })
    }
}

function saveLogs(){
    console.log = function(){
        var str = '';
        for(var i in arguments){
            if(typeof arguments[i] === 'string'){
                str += arguments[i];
            }
            if(typeof arguments[i] === 'object'){
                try {
                str += JSON.stringify(arguments[i]);
                } catch(e){
                    str += '[not parseable object]'
                }
            }
            if(typeof arguments[i] === 'number'){
                str += arguments[i].toString();
            }
            if(typeof arguments[i] === 'boolean'){
                str += arguments[i];
            }
        }
        fs.appendFile(path.join(__dirname, '..', 'nogger.log'), str + '\n');
    }
}
