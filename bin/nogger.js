#!/usr/bin/env node
var fs = require('fs');
var Liftoff = require('liftoff');
var path = require('path');
var exec = require('child_process').exec;
var child_process = require('child_process');
var chalk = require('chalk');
var argv = require('minimist')(process.argv.slice(2));

var daemon = require('daemonize2').setup({
    main: '../index.js',
    name: 'nogger',
    pidfile: 'nogger.pid'
});

var cli = new Liftoff({
    name: 'nogger',
    moduleName: 'nogger',
    processTitle: 'nogger'
});
var pkg = require('./../package');

var config = require('../config.json') || {};
var configDefaults = require('../configDefaults.json');
var configPath = path.resolve(__dirname, '..', 'config.json');
var blockedList = require('../blockedList.json');
var blockedListPath = path.resolve(__dirname, '..', 'blockedList.json');


var commands = {
    start: function () {
        var path = argv._[1];
        var pid = daemon.status();
        if (pid) {
            console.log('nogger is already running. PID: ' + pid);
        } else {
            daemon.start(function (err, pid) {
                if (!err) {
                    require('dns').lookup(require('os').hostname(), function (err, add, fam) {
                        console.log('Nogger listening on ' + add + ':' + (config.noggerPort || configDefaults.noggerPort));
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
    config: function () {
        logDataLine('current configuration');
        logDataLine('');
        for (var i in config) {
            logDataLine('  ' + i, config[i]);
        }
        for (var j in configDefaults) {
            if (config[j] === undefined) {
                logDataLine('  ' + j, configDefaults[j] + '  ' + chalk.gray('(default)'))
            }
        }
    },
    set: function () {
        var key = argv._[1];
        var val = argv._[2];
        if (!key || !val) {
            console.log(chalk.red('usage: nogger set <key> <val>'));
            help();
        } else {
            if (configDefaults[key] === undefined) {
                console.log(chalk.red('invalid key'));
                console.log('');
            } else {
                config[key] = val;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                console.log('updated config!');
                console.log('');
            }
            commands.config();
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
    //logHelpLine('    start <path>     Starts nogger as a daemon. Path points to a folder where config is located. Default is "./"');
    logHelpLine('    start            Starts nogger as a daemon');
    logHelpLine('    stop             Stops the nogger daemon');
    logHelpLine('    status           Returns if nogger is running or not');
    logHelpLine('    config           Lists all nogger configurations');
    logHelpLine('    set <key> <val>  Sets the key of the config');
    logHelpLine('    clear <key>      Clears the key from the config');
    logHelpLine('    setpw <password> Updates the password for the dashboard');
    logHelpLine('    showblocked      Displays blocked list');
    logHelpLine('    block <ip>       Adds ip to blocked list');
    logHelpLine('    unblock <ip>     Unblocks a ip from blocked list');
    logHelpLine('    version          Shows current nogger version');
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
