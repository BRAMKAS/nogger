#! /usr/bin/env node

var fs = require('fs');
var Liftoff = require('liftoff');
var path = require('path');
var chalk = require('chalk');
var daemonize2 = require('daemonize2');
var argv = require('minimist')(process.argv.slice(2));

var cli = new Liftoff({
    name: 'nogger',
    moduleName: 'nogger',
    processTitle: 'nogger'
});

var pkg = require('./../package');
var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var noggerDir = '.nogger';
var settingsPath = path.resolve(home, noggerDir, 'settings.json');
var noop = function () {
};

var settings = {
    instances: [],
    blockedList: []
};
var instanceLookup = {};

var commands = {
    start: function () {
        var id = argv.id || argv.i;
        if (id && !isUniqueId(id)) {
            console.log('id already exists');
            return;
        }
        var instance = new Instance({
            id: id,
            path: argv._[1],
            port: argv.p || argv.port,
            cert: argv.c || argv.cert,
            key: argv.k || argv.key,
            pw: argv.w || argv.pw
        });
        if (instance.errors) {
            console.log('');
            console.log('  Errors:');
            instance.errors.forEach(function (error) {
                console.log('     ' + error);
            });
            console.log('');
            help();
            return;
        }

        var success = instance.start(function () {
            saveSettings();
            list();
        });
        if (success) {
            settings.instances.push(instance);
            saveSettings();
        }
    },
    restart: function () {
        var instance = getInstanceById(argv._[1]);
        if (!instance) {
            return;
        }
        instance.restart(function () {
            list();
        });
    },
    restartall: function(){
        var finished = 0;
        var expect = settings.instances.length;
        settings.instances.forEach(function(instance){
            instance.restart(function(){
                finished++;
                if(finished == expect){
                    list();
                }
            });
        });
    },
    stop: function () {
        var instance = getInstanceById(argv._[1]);
        if (!instance) {
            return;
        }
        instance.stop(function () {
            list();
        });
    },
    stopall: function(){
        var finished = 0;
        var expect = settings.instances.length;
        settings.instances.forEach(function(instance){
            instance.stop(function(){
                finished++;
                if(finished == expect){
                    list();
                }
            });
        });
    },
    remove: function () {
        var instance = getInstanceById(argv._[1]);
        if (!instance) {
            return;
        }
        instance.remove(function () {
            list();
        });
    },
    removeall: function(){
        var finished = 0;
        var expect = settings.instances.length;
        settings.instances.forEach(function(instance){
            instance.remove(function(){
                finished++;
                if(finished == expect){
                    list();
                }
            });
        });
    },
    list: function () {
        list();
    },
    setpw: function () {
        var newPw = argv._[1];
        if (!newPw) {
            newPw = generatePassword();
        }
        newPw = newPw.toString();
        if (argv._[2]) {
            var instance = getInstanceById(argv._[2]);
            if (!instance) {
                return;
            }
            instance.pw = newPw;
            console.log('performing restart to apply changes');
            instance.restart();
            saveSettings();
            console.log('updated password for ' + instance.id + ': ' + newPw);
        } else {
            console.log('performing restart to apply changes');
            settings.instances.forEach(function (instance) {
                instance.pw = newPw;
                instance.restart();
            });
            saveSettings();
            console.log('updated password for all instances: ' + newPw);
        }

    },
    showblocked: function () {
        logBlockedList();
    },
    block: function () {
        var ip = argv._[1];
        if (!ip) {
            console.log('please specify an ip to be blocked');
            help();
            return;
        }
        ip = ip.toString().toLowerCase();
        var found = false;
        console.log(settings.blockedList);
        settings.blockedList.some(function (item) {
            if (item === ip) {
                found = true;
            }
            return found;
        });
        if (!found) {
            settings.blockedList.push(ip.toString());
            console.log('added to blocked list');
        } else {
            console.log('already in list');
        }
        logBlockedList();
        saveSettings();
        console.log('performing restart to apply changes');
        settings.instances.forEach(function (instance) {
            instance.restart();
        });
    },
    unblock: function () {
        var ip = argv._[1];
        if (!ip) {
            console.log('please specify an ip to be blocked');
            help();
            return;
        }
        ip = ip.toString().toLowerCase();
        var found = false;
        var index = -1;
        settings.blockedList.some(function (item, i) {
            if (item === ip) {
                found = true;
                index = i;
            }
            return found;
        });
        if (!found) {
            console.log('not found in blocked list');
        } else {
            settings.blockedList.splice(index, 1);
            console.log('removed from blocked list');
        }
        logBlockedList();
        saveSettings();
        console.log('performing restart to apply changes');
        settings.instances.forEach(function (instance) {
            instance.restart();
        });
    },
    version: function () {
        console.log(pkg.name + ' ' + pkg.version);
    }
};


/**
 ******** Helpers
 */

function list() {
    console.log('');
    console.log(chalk.cyan('|--------------------------------------------------------------|'));
    console.log(chalk.cyan('|---id---|--port--|------------logfile--------------|--status--|'));
    console.log(chalk.cyan('|--------------------------------------------------------------|'));
    console.log(chalk.cyan('|        |        |                                 |          |'));
    var somethingRunning = false;
    settings.instances.forEach(function (instance) {
        logListLine([instance.id, instance.port, instance.path, instance.status]);
        somethingRunning = true;
    });
    console.log(chalk.cyan('|        |        |                                 |          |'));
    console.log(chalk.cyan('|--------------------------------------------------------------|'));

    if (!somethingRunning) {
        console.log(chalk.cyan('  no nogger instances running'));
    }
}

function logListLine(arr) {
    var result = chalk.cyan('|');
    var blockLengths = [8, 8, 33, 10];
    arr.forEach(function (item, index) {
        result += fill(item, blockLengths[index]) + chalk.cyan('|');
    });
    console.log(result);
}

function help() {
    console.log(chalk.cyan('|--HELP--------------------------------------------------------|'));
    logHelpLine('');
    logHelpLine('usage: nogger [action]');
    logHelpLine('');
    logHelpLine('');
    logHelpLine('actions:');
    logHelpLine('');
    logHelpLine(' start [path]       Starts nogger with logfile path');
    logHelpLine('  -w, --pw <key>)   Optional. Set password for dashboard.');
    logHelpLine('                      If not set a password is generated.');
    logHelpLine('  -i, --id <id>)    Optional. A identifier that can be used');
    logHelpLine('                     instead of a generated one');
    logHelpLine('  -p, --port <port> Optional. Port for dashboard.');
    logHelpLine('  -c, --cert <cert> Optional. Provide SSL certificate in');
    logHelpLine('                     order to avoid having to manually');
    logHelpLine('                     confirm the certificate in the browser');
    logHelpLine('  -k, --key <key>   Optional. Provide SSL key in order to');
    logHelpLine('                     avoid having to manually confirm the');
    logHelpLine('                     certificate in the browser');
    logHelpLine(' restart <id>       Restarts an available instance');
    logHelpLine(' restartall         Restarts all available instances');
    logHelpLine(' stop <id>          Stops the nogger daemon');
    logHelpLine(' stopall            Stops all nogger daemons');
    logHelpLine(' remove <id>        Removes an instance from the list');
    logHelpLine(' removeall          Removes all instances from the list');
    logHelpLine(' list               Returns list of nogger instances running');
    logHelpLine('');
    logHelpLine(' setpw <pw> (<id>)    Updates the password for the dashboard.');
    logHelpLine(' showblocked        Displays blocked list(s)');
    logHelpLine(' block <ip>         Add ip to blocked list(s)');
    logHelpLine(' unblock <ip>       Unblocks an ip from blocked list(s)');
    logHelpLine('');
    logHelpLine(' -v, --version      Shows current nogger version');
    logHelpLine(' -h, --help         Shows help menu');
    logHelpLine('');
    console.log(chalk.cyan('|--------------------------------------------------------------|'));
}

function logHelpLine(val) {
    console.log(chalk.cyan('|'), fill(val, 60, true), chalk.cyan('|'));
}

function logBlockedList() {
    console.log(chalk.cyan('|' + fill('blocked list', 32, false, '-') + '|'));
    if (settings.blockedList.length === 0) {
        console.log(chalk.cyan('|'), fill('no blocked ip addresses', 30), chalk.cyan('|'));
    } else {
        settings.blockedList.forEach(function (ip) {
            console.log(chalk.cyan('|'), fill(ip, 30), chalk.cyan('|'));
        });
    }
    console.log(chalk.cyan('|--------------------------------|'));
    console.log('');
}

function fill(val, length, left, filler) {
    filler = filler || ' ';
    val = val + '';
    if (val.length > length) {
        return val.substr(0, length);
    }
    var split = length - val.length;
    var result = '';
    if (left) {
        result = val;
        for (var j = 0; j < split; j++) {
            result += filler;
        }
        return result;
    } else {
        var first, second;
        if (split % 2 == 1) {
            first = Math.ceil(split / 2);
            second = Math.floor(split / 2);
        } else {
            first = split / 2;
            second = first;
        }
        for (var i = 0; i < first; i++) {
            result += filler;
        }
        result += val;
        for (i = 0; i < second; i++) {
            result += filler;
        }
        return result;
    }
}

function getDaemon(instance) {
    return daemonize2.setup({
        main: path.resolve(__dirname, '..', 'index.js'),
        name: 'nogger-' + instance.id,
        pidfile: path.resolve(home, noggerDir, instance.id + '.pid'),
        argv: [
            instance.id
        ]
    });
}

function initSettings() {
    var rawSettings;
    try {
        rawSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (e) {
        try {
            fs.mkdirSync(path.resolve(home, noggerDir));
        } catch (e) {
        }
    }

    if (rawSettings) {
        rawSettings.instances.forEach(function (instance, index) {
            var daemon = getDaemon(instance);
            var pid = daemon.status();
            if (!pid) {
                if (instance.status === 'running') {
                    instance.status = 'killed';
                }
                fs.unlink(path.resolve(home, noggerDir, instance.id + '.pid'), function (err) {
                })
            } else {
                instance.status = 'running';

            }
            instanceLookup[instance.id.toUpperCase()] = index;
            settings.instances.push(new Instance(instance));
        });
        settings.blockedList = rawSettings.blockedList;
    }
}

function saveSettings() {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));
}

function getInstanceById(id) {
    if (!id) {
        console.log('');
        console.log('Please specify the id of a running instance');
        console.log('');
        help();
        return;
    }
    id = id.toUpperCase();
    if (instanceLookup[id] === undefined) {
        console.log('');
        console.log(id + ' is not running');
        console.log('');
        list();
        return;
    }
    return settings.instances[instanceLookup[id]];
}

function generateUniqueId(add) {
    add = add || 0;
    var id = ((+new Date - 1420000000000 + add)).toString(36).toUpperCase().substr(-4);
    if (isUniqueId(id)) {
        return id;
    } else {
        return generateUniqueId(Math.round(Math.random() * 100));
    }
}

function isUniqueId(id) {
    var unique = true;
    settings.instances.some(function (instance) {
        if (instance.id.toUpperCase() === id.toUpperCase()) {
            if (instance.status === 'running') {
                unique = false;
                return true;
            } else {
                instance.remove();
            }
        }
        return false;
    });
    return unique;
}

function portUsed(port, exclude) {
    return settings.instances.some(function (instance) {
        return instance.id !== exclude && instance.port === port;
    });
}

function generatePassword() {
    return Math.random().toString(36).slice(-8);
}


/**
 ****************** Nogger Instance Object
 */

function Instance(data) {
    this.path = data.path;
    this.port = data.port;
    this.cert = data.cert;
    this.key = data.key;
    this.id = data.id;
    this.pw = data.pw;

    this.status = data.status || 'starting';

    var errors = [];

    if (!this.port) {
        this.port = 3000;
        while(portUsed(this.port)){
            this.port++;
        }
    }

    if (portUsed(this.port, this.id)) {
        errors.push('port already in use');
    }

    if (!this.id) {
        this.id = generateUniqueId();
    }
    this.id = this.id.toString().toUpperCase();
    if (this.id.length > 8) {
        errors.push('id too long, max length is 8');
    }

    if (!this.path) {
        errors.push('no path to logfile specified');
    } else {
        this.path = path.resolve(this.path);
        try {
            fs.readFileSync(this.path);
        } catch (e) {
            errors.push('could not open log file in location ' + this.path);
        }
    }

    if (this.cert || this.key) {
        if (!this.cert) {
            errors.push('key file set, but not cert file');
        } else {
            this.cert = path.resolve(this.cert);
            try {
                fs.readFileSync(this.cert);
            } catch (e) {
                errors.push('could not open cert file in location ' + this.cert);
            }
        }
        if (!this.key) {
            errors.push('cert file set, but not key file');
        } else {
            this.key = path.resolve(this.key);
            try {
                fs.readFileSync(this.key);
            } catch (e) {
                errors.push('could not open key file in location ' + this.key);
            }
        }
    }

    if (errors.length > 0) {
        this.errors = errors;
    } else {
        if (!this.pw) {
            this.pw = generatePassword();
            console.log('generated a password for dashboard: ', chalk.magenta(this.pw));
        }
        this.pw = this.pw.toString();
    }
}

Instance.prototype.start = function (callback) {
    callback = callback || noop;
    var daemon = getDaemon(this);
    var self = this;
    var pid = daemon.status();
    if (pid) {
        console.log('nogger instance with this id is already running. PID: ' + pid);
        return false;
    } else {
        daemon.start(function (err, pid) {
            if (!err) {
                require('dns').lookup(require('os').hostname(), function (err, add, fam) {
                    console.log('Nogger listening on https://' + add + ':' + self.port);
                    self.status = 'running';
                    callback()
                });
            } else {
                self.status = 'error';
                callback()
            }
        });
        return true;
    }
};

Instance.prototype.stop = function (callback) {
    callback = callback || noop;
    var self = this;
    var daemon = getDaemon(this);
    var pid = daemon.status();
    if (pid) {
        daemon.stop(function () {
            self.status = 'stopped';
            saveSettings();
            callback();
        });
    } else {
        console.log('');
        console.log(this.id + ' is not running');
        console.log('');
        callback();
    }
};

Instance.prototype.restart = function (callback) {
    callback = callback || noop;
    var self = this;
    if (this.status === 'running') {
        this.stop(function () {
            self.start(function () {
                saveSettings();
                callback();
            });
        });
    } else {
        this.start(function () {
            saveSettings();
            callback();
        });
    }
};

Instance.prototype.remove = function (callback) {
    callback = callback || noop;
    if (this.status === 'running') {
        var self = this;
        var daemon = getDaemon(this);
        var pid = daemon.status();
        if (pid) {
            daemon.stop(function () {
                self.del();
                callback();
            });
        } else {
            this.del();
            callback();
        }
    } else {
        this.del();
        callback();
    }
};

Instance.prototype.del = function () {
    settings.instances.splice(instanceLookup[this.id], 1);

    instanceLookup = {};
    settings.instances.forEach(function (instance, index) {
        instanceLookup[instance.id.toUpperCase()] = index;
    });
    saveSettings();
};


// start


initSettings();
saveSettings();

cli.launch({}, function (env) {
    if (argv._.length && commands[argv._[0]]) {
        commands[argv._[0]]();
    } else {
        if (argv.v || argv.version) {
            commands.version();
        } else {
            help();
            process.exit(1);
        }
    }
});
