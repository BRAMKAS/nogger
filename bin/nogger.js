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

var blockedList = require('../blockedList.json');
var blockedListPath = path.resolve(__dirname, '..', 'blockedList.json');

var noggerDir = '.nogger';
var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var settingsPath = path.resolve(home, noggerDir, 'settings.json');
var settings = {
    instances: []
};


try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
} catch (e) {
    try {
        fs.mkdirSync(path.resolve(home, noggerDir));
    } catch (e) {

    }
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4));
}

var commands = {
    start: function () {
        var instance = new Instance(argv);
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
        var daemon = daemonize2.setup({
            main: '../index.js',
            name: 'nogger-' + instance.name,
            pidfile: path.resolve(home, noggerDir, instance.name + '.pid'),
            args: [
                instance.port,
                argv._[1]
            ]
        });
        console.log(instance);
        var pid = daemon.status();
        if (pid) {
            console.log('nogger instance with this name is already running. PID: ' + pid);
        } else {
            daemon.start(function (err, pid) {
                if (!err) {
                    require('dns').lookup(require('os').hostname(), function (err, add, fam) {
                        console.log('Nogger listening on ' + add + ':' + instance.port);
                    });
                }
            });
        }
    },
    stop: function () {
        daemon.stop();
    },
    status: function () {
        var pid = daemon.status();
        if (pid) {
            console.log('nogger is running. PID: ' + pid);
        } else {
            console.log('nogger is not running');
        }
    },
    setpw: function () {
        var password = require('./../back/password');
        console.log('encrypting password...');
        password.set(argv._[1], function () {
            console.log('password saved!');
            process.exit();
        });
    },
    showblocked: function () {
        console.log(JSON.stringify(blockedList));
    },
    block: function () {
        var index = blockedList.ip.indexOf(argv._[1]);
        if (index === -1) {
            blockedList.ip.push(argv._[1]);
            fs.writeFileSync(blockedListPath, JSON.stringify(blockedList, null, 4));
            console.log('blocked ip ' + argv._[1]);
        } else {
            console.log(chalk.red('ip ' + argv._[1] + ' is already on blockedList'));
        }
    },
    unblock: function () {
        var index = blockedList.ip.indexOf(argv._[1]);
        if (index !== -1) {
            blockedList.ip.splice(index, 1);
            fs.writeFileSync(blockedListPath, JSON.stringify(blockedList, null, 4));
            console.log('unblocked ip ' + argv._[1]);
        } else {
            console.log(chalk.red('ip ' + argv._[1] + ' is not on blockedList'));
        }
    },
    version: function () {
        console.log(pkg.name + ' ' + pkg.version);
    }
};


cli.launch({}, function (env) {
    if (argv._.length && commands[argv._[0]]) {
        commands[argv._[0]]();
    } else {
        help();
        process.exit(1);
    }
});

function help() {
    logHelpLine('');
    logHelpLine('usage: nogger [action]');
    logHelpLine('');
    logHelpLine('');
    logHelpLine('  actions:');
    logHelpLine('');
    logHelpLine('    start [path]          Starts nogger as a daemon. Put path to logfile.');
    logHelpLine('      (-p, --port <port>) Optional. Port where nogger will be accessible.');
    logHelpLine('                           If not set this will be assigned automatically');
    logHelpLine('      (-n, --name <name>) Optional. A name that can be used instead of');
    logHelpLine('                           id to identify an instance of nogger');
    logHelpLine('      (-c, --cert <cert>) Optional. Provide SSL certificate in order to');
    logHelpLine('                           avoid having to manually confirm the');
    logHelpLine('                           certificate in the browser');
    logHelpLine('      (-k, --key <key>)   Optional. Provide SSL key in order to avoid');
    logHelpLine('                           having to manually confirm the certificate');
    logHelpLine('                           in the browser');
    logHelpLine('    stop <id/name>        Stops the nogger daemon');
    logHelpLine('    stopall               Stops all nogger daemons');
    logHelpLine('    list                  Returns list of nogger instances running');
    logHelpLine('');
    logHelpLine('    setpw <password>      Updates the password for the dashboard.');
    logHelpLine('    showblocked           Displays blocked list of instance or all');
    logHelpLine('    block <ip>            Adds ip to blocked list of instance or all');
    logHelpLine('    unblock <ip>          Unblocks an ip from blocked list');
    logHelpLine('      (<id/name>)         Optional add ip or name to these commands');
    logHelpLine('                           as second parameter in order to apply to');
    logHelpLine('                           only one instance.');
    logHelpLine('');
    logHelpLine('    -v, --version                Shows current nogger version');
    logHelpLine('    -h, --help                   Shows help menu');
    logHelpLine('');
}

function logHelpLine(val) {
    console.log(chalk.cyan('help') + ':', val);
}

function logDataLine(val, val2) {
    var space = '';
    if (val2 !== undefined) {
        if (val.length < 17) {
            for (var i = 0; i < 17 - val.length; i++) {
                space += ' ';
            }
        }
    } else {
        val2 = '';
    }
    console.log(chalk.magenta('data') + ':', val + space + val2);
}


function Instance(argv) {
    this.path = argv._[1];
    this.port = argv.p || argv.port;
    if (!this.port) {
        if (settings.instances.length > 0) {
            this.port = settings.instances[settings.instances.length - 1];
        } else {
            this.port = 3000;
        }
    }

    this.name = argv.n || argv.name;
    if (!this.name) {
        this.name = generateUniqueName();
    }

    this.cert = argv.c || argv.cert;
    this.key = argv.k || argv.key;


    this.errors = [];
    if (!this.path) {
        this.errors.push('no path to logfile specified');
    } else {
        try {
            fs.readFileSync(this.path);
        } catch (e) {
            this.errors.push('could not open log file');
        }
    }

    if (this.cert || this.key) {
        if (!this.cert) {
            this.errors.push('key file set, but not cert file');
        } else {
            try {
                fs.readFileSync(path.resolve(this.key));
            } catch (e) {
                this.errors.push('could not open key file');
            }
        }
        if (!this.key) {
            this.errors.push('cert file set, but not key file');
        } else {
            try {
                fs.readFileSync(path.resolve(this.cert));
            } catch (e) {
                this.errors.push('could not open cert file');
            }
        }
    }
    if (this.errors.length === 0) {
        this.errors = false;
    }
}


function generateUniqueName(add) {
    add = add || 0;
    var name = ((+new Date - 1420000000000 + add)).toString(36).toUpperCase().substr(-4);
    var unique = true;
    settings.instances.some(function (instance) {
        if (instance.name === name) {
            unique = false;
            return true;
        }
        return false;
    });
    if (unique) {
        return name;
    } else {
        return generateUniqueName(Math.round(Math.random() * 100));
    }
}
