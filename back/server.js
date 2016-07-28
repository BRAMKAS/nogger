'use strict';
var fs = require('fs');
var express = require('express.io');
var path = require('path');
var app = express();
var argv = require('minimist')(process.argv.slice(2));
var pem = require('pem');
var _ = require('underscore');
var Tail = require('tail').Tail;
var lineReader = require('reverse-line-reader');

var pkg = require('./../package');
var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var noggerDir = '.nogger';
var settingsPath = path.resolve(home, noggerDir, 'settings.json');

var id = argv._[0];

saveLogs();
var settings = readSettings();
var instance = getInstance();

if (!instance) {
    console.log('Error: id not found');
    process.exit();
    return;
}

console.log('Info: starting server');
var tail = new Tail(instance.path);
unwatchTail();
tail.on("line", function (data) {
    broadcast('line', data);
});
tail.on("error", function (error) {
    console.log('Error: tail: ', error);
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
        console.log('Info: Auth, ip:', ip);
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
            if (clients.length === 1) {
                tail.watch();
            }
            var s = readSettings();
            var running = [];
            s.instances.forEach(function (otherInstance) {
                if (otherInstance.status === "running" && otherInstance.id !== instance.id) {
                    running.push({
                        id: otherInstance.id,
                        path: otherInstance.path,
                        port: otherInstance.port
                    });
                }
            });

            fs.stat(instance.path, function (err, stats) {
                if (err) {
                    console.log('Error: fstat:', err);
                    stats = {};
                }
                req.io.respond({
                    err: null,
                    data: {
                        version: pkg.version,
                        instance: {
                            id: instance.id,
                            path: instance.path,
                            port: instance.port,
                            size: stats.size
                        },
                        otherInstances: running
                    }
                });
            })
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

    app.io.route('search', function (req) {
        if (checkAuth(req)) {
            var found = [];
            var lookbeforeBuffer = [];
            var total = 0;
            var skipped = 0;
            var data = req.data;
            data.input = data.input || '';
            data.start = data.start || 0;
            data.limit = data.limit || 500;
            data.skipResults = data.skipResults || 0;
            data.lookbefore = data.lookbefore || 0;
            data.lookafter = data.lookafter || 0;
            var regex;
            if (data.regex) {
                try {
                    regex = new RegExp(data.input, data.caseSensitive ? '' : 'i');
                } catch (e) {
                    req.io.respond({err: 'regex not valid', data: null});
                    return;
                }
            } else {
                data.input = data.input.toLowerCase();
            }
            var match;
            var matchAfter = 0;
            lineReader.eachLine(instance.path, function (line, last) {
                total++;
                if (total > data.start) {
                    match = false;
                    if (regex) {
                        match = line.match(regex);
                    } else {
                        match = line.toLowerCase().indexOf(data.input) !== -1;
                    }


                    if(match || matchAfter){
                        if(skipped < data.skipResults){
                            skipped++;
                        } else {
                            if(lookbeforeBuffer.length){
                                lookbeforeBuffer.forEach(function(beforeLine){
                                    found.push(beforeLine);
                                });
                                lookbeforeBuffer = [];
                            }
                            found.push(line);
                            if(data.lookafter && match){
                                matchAfter = data.lookafter;
                            }
                            if(matchAfter){
                                matchAfter--;
                            }
                        }
                    }
                    if (found.length > (data.limit)) {
                        req.io.respond({err: null, data: {result: found}});
                        return false;
                    }
                }
                if (last) {
                    req.io.respond({err: null, data: {result: found, total: total}});
                } else {
                    if(data.lookbefore){
                        lookbeforeBuffer.push(line);
                        if(lookbeforeBuffer.length > data.lookbefore){
                            lookbeforeBuffer.splice(0, 1);
                        }
                    }
                }
            });
        } else {
            req.io.respond({err: "not authenticated", data: null});
        }
    });


    app.io.route('disconnect', function (req) {
        var index = clients.indexOf(req.io.socket.id);
        if (index !== -1) {
            clients.splice(index, 1);
        }
        if (clients.length == 0) {
            unwatchTail();
        }
    });


    app.get('*', function (req, res) {
        res.sendfile(path.join(__dirname, '../front/index.html'));
    });


    app.listen(instance.port);
    require('dns').lookup(require('os').hostname(), function (err, add, fam) {
        console.log('Info: server running on ' + add + ':' + instance.port);
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
            console.log('Error: saving settings file', err);
        }
    });
}

function getCertificate(callback) {
    if (instance.cert && instance.key) {
        fs.readFile(instance.cert, 'utf8', function (err, cert) {
            if (err) {
                console.log('Error: reading cert file', err);
                process.exit();
            } else {
                fs.readFile(instance.key, 'utf8', function (err, key) {
                    if (err) {
                        console.log('Error: reading key file', err);
                        process.exit();
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
            if (err && !keys) {
                console.log("Error: creating cert", err, keys);
                process.exit();
            } else {
                callback({
                    key: keys.serviceKey,
                    cert: keys.certificate
                });
            }
        })
    }
}

function saveLogs() {
    console.log = function () {
        var str = '';
        for (var i in arguments) {
            if (typeof arguments[i] === 'string') {
                str += arguments[i];
            }
            if (typeof arguments[i] === 'object') {
                try {
                    str += JSON.stringify(arguments[i]);
                } catch (e) {
                    str += '[not parseable object]'
                }
            }
            if (typeof arguments[i] === 'number') {
                str += arguments[i].toString();
            }
            if (typeof arguments[i] === 'boolean') {
                str += arguments[i];
            }
        }
        fs.appendFile(path.join(__dirname, '..', 'nogger.log'), str + '\n');
    }
}

function unwatchTail() {
    // fix for reset of pos bug
    var firstPos = tail.pos;
    tail.unwatch();
    tail.pos = firstPos;
}
