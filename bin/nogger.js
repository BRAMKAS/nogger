#!/usr/bin/env node
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

var settings = {
    instances: []
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
        instance.start(function () {
            settings.instances.push(instance);
            saveSettings();
            list();
        });
    },
    restart: function () {
        var instance = getInstanceById(argv._[1]);
        if (!instance) {
            return;
        }
        instance.start(function () {
            saveSettings();
            list();
        });
    },
    stop: function () {
        var instance = getInstanceById(argv._[1]);
        if (!instance) {
            return;
        }
        instance.stop();
        list();
    },
    remove: function () {
        var instance = getInstanceById(argv._[1]);
        if (!instance) {
            return;
        }
        instance.remove();
        list();
    },
    list: function () {
        list();
    },
    setpw: function () {
        var newPw = argv._[1];
        if (!newPw) {
            newPw = generatePassword();
        }
        if (argv._[2]) {
            var instance = getInstanceById(argv._[2]);
            if (!instance) {
                return;
            }

            instance.pw = newPw;
            saveSettings();
            console.log('updated password for ' + instance.id + ': ' + newPw);
        } else {
            settings.instances.forEach(function (instance) {
                instance.pw = newPw;
            });
            saveSettings();
            console.log('updated password for all instances: ' + newPw);
        }

    },
    showblocked: function () {
        var instances;
        if (argv._[1]) {
            var instance = getInstanceById(argv._[1]);
            if (!instance) {
                return;
            }
            instances = [instance];
        } else {
            instances = settings.instances;
        }
        console.log('');
        instances.forEach(function (instance) {
            logBlockedList(instance);
        });
    },
    block: function () {
        var ip = argv._[1];
        if (!ip) {
            console.log('please specify an ip to be blocked');
            help();
            return;
        }
        var instances;
        if (argv._[2]) {
            var instance = getInstanceById(argv._[2]);
            if (!instance) {
                return;
            }
            instances = [instance];
        } else {
            instances = settings.instances;
        }

        var found;
        instances.forEach(function (instance) {
            found = false;
            instance.blockedList.some(function (item) {
                if (item === ip) {
                    found = true;
                }
                return found;
            });
            if (!found) {
                instance.blockedList.push(ip);
                console.log(instance.id + ': added to blocked list');
            } else {
                console.log(instance.id + ': already in list');
            }
            logBlockedList(instance);
        });
        saveSettings();
    },
    unblock: function () {
        var ip = argv._[1];
        if (!ip) {
            console.log('please specify an ip to be blocked');
            help();
            return;
        }
        var instances;
        if (argv._[2]) {
            var instance = getInstanceById(argv._[2]);
            if (!instance) {
                return;
            }
            instances = [instance];
        } else {
            instances = settings.instances;
        }

        var found;
        var index;
        instances.forEach(function (instance) {
            found = false;
            index = -1;
            instance.blockedList.some(function (item, i) {
                if (item === ip) {
                    found = true;
                    index = i;
                }
                return found;
            });
            if (!found) {
                console.log(instance.id + ': not found in blocked list');
            } else {
                instance.blockedList.splice(index, 1);
                console.log(instance.id + ': removed from blocked list');
            }
            logBlockedList(instance);
        });
        saveSettings();
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
    console.log(chalk.cyan('|------id------|--port--|---------logfile---------|---status---|'));
    console.log(chalk.cyan('|--------------------------------------------------------------|'));
    console.log(chalk.cyan('|              |        |                         |            |'));
    var somethingRunning = false;
    settings.instances.forEach(function (instance) {
        logListLine([instance.id, instance.port, instance.path, instance.status]);
        somethingRunning = true;
    });
    console.log(chalk.cyan('|              |        |                         |            |'));
    console.log(chalk.cyan('|--------------------------------------------------------------|'));

    if (!somethingRunning) {
        console.log(chalk.cyan('  no nogger instances running'));
    }
}

function logListLine(arr) {
    var result = chalk.cyan('|');
    var blockLengths = [14, 8, 25, 12];
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
    logHelpLine(' stop <id>          Stops the nogger daemon');
    logHelpLine(' remove <id>        Removes an instance from the list');
    logHelpLine(' stopall            Stops all nogger daemons');
    logHelpLine(' list               Returns list of nogger instances running');
    logHelpLine('');
    logHelpLine(' setpw <password>   Updates the password for the dashboard.');
    logHelpLine(' showblocked        Displays blocked list(s)');
    logHelpLine(' block <ip>         Add ip to blocked list(s)');
    logHelpLine(' unblock <ip>       Unblocks an ip from blocked list(s)');
    logHelpLine('  <id>              Optional add ip or id to these commands');
    logHelpLine('                     as second parameter in order to apply');
    logHelpLine('                     to only one instance.');
    logHelpLine('');
    logHelpLine(' -v, --version      Shows current nogger version');
    logHelpLine(' -h, --help         Shows help menu');
    logHelpLine('');
    console.log(chalk.cyan('|--------------------------------------------------------------|'));
}

function logHelpLine(val) {
    console.log(chalk.cyan('|'), fill(val, 60, true), chalk.cyan('|'));
}

function logBlockedList(instance) {
    console.log(chalk.cyan('|' + fill('blocked list for ' + instance.id, 32, false, '-') + '|'));
    if (instance.blockedList.length === 0) {
        console.log(chalk.cyan('|'), fill('no blocked ip addresses', 30), chalk.cyan('|'));
    } else {
        instance.blockedList.forEach(function (ip) {
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
            argv._[1],
            instance.port,
            instance.id,
            instance.cert,
            instance.key
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
        instanceLookup[instance.id] = index;
        settings.instances.push(new Instance(instance));
    });
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
        if (instance.id === id) {
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

    this.blockedList = data.blockedList || [];
    this.status = data.status || 'starting';

    var errors = [];

    if (!this.port) {
        if (settings.instances.length > 0) {
            this.port = settings.instances[settings.instances.length - 1].port + 1;
        } else {
            this.port = 3000;
        }
    }

    if (!this.id) {
        this.id = generateUniqueId();
    }

    if (this.id.length > 14) {
        errors.push('id too long, max length is 14');
    }

    if (!this.path) {
        errors.push('no path to logfile specified');
    } else {
        try {
            fs.readFileSync(this.path);
        } catch (e) {
            errors.push('could not open log file');
        }
    }

    if (this.cert || this.key) {
        if (!this.cert) {
            errors.push('key file set, but not cert file');
        } else {
            try {
                fs.readFileSync(path.resolve(this.cert));
            } catch (e) {
                errors.push('could not open cert file');
            }
        }
        if (!this.key) {
            errors.push('cert file set, but not key file');
        } else {
            try {
                fs.readFileSync(path.resolve(this.key));
            } catch (e) {
                errors.push('could not open key file');
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
    }
}

Instance.prototype.start = function (callback) {
    callback = callback || function () {
    };
    var daemon = getDaemon(this);
    var self = this;
    var pid = daemon.status();
    if (pid) {
        console.log('nogger instance with this id is already running. PID: ' + pid);
    } else {
        daemon.start(function (err, pid) {
            if (!err) {
                require('dns').lookup(require('os').hostname(), function (err, add, fam) {
                    console.log('Nogger listening on ' + add + ':' + self.port);
                    self.status = 'running';
                    callback()
                });
            }
        });
    }
};

Instance.prototype.stop = function () {
    if (this.status === 'running') {
        var daemon = getDaemon(this);
        var pid = daemon.status();
        if (pid) {
            daemon.stop();
            this.status = 'stopped';
        } else {
            console.log('');
            console.log(this.id + ' is not running');
            console.log('');
        }
    } else {
        console.log('');
        console.log(this.id + ' is not running');
        console.log('');
    }
    saveSettings();
};

Instance.prototype.remove = function () {
    if (this.status === 'running') {
        var daemon = getDaemon(this);
        var pid = daemon.status();
        if (pid) {
            daemon.stop();
        }
    }
    settings.instances.splice(instanceLookup[this.id], 1);
    delete instanceLookup[this.id];
    saveSettings();
};


// start


initSettings();
saveSettings();

cli.launch({}, function (env) {
    if (argv._.length && commands[argv._[0]]) {
        commands[argv._[0]]();
    } else {
        help();
        process.exit(1);
    }
});
