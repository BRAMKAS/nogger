#!/usr/bin/env node
'use strict';
var Liftoff = require('liftoff');
var path = require('path');
var exec = require('child_process').exec;
var child_process = require('child_process');
var chalk = require('chalk');
var argv = require('minimist')(process.argv.slice(2));
var daemon = require("daemonize2").setup({
    main: "../index.js",
    name: "nogger",
    pidfile: "nogger.pid"
});

var cli = new Liftoff({
    name: 'nogger',
    moduleName: 'nogger',
    processTitle: 'nogger'
});
var pkg = require('./../package');

var runnning = false;

var commands = {
    start: function () {
        daemon.start();
    },
    stop: function () {
        daemon.stop();
    },
    set: function () {
        // set config
    },
    setpassword: function () {
        var password = require("./../back/password");
        console.log('setting password to "' + argv._[1] + '"');

        password.set(argv._[1], function () {
            console.log('password set');
            process.exit();
        });
    },
    unblock: function () {

    },
    help: function () {
        var available = "Usage: [";
        for (var i in commands) {
            available += i + "|";
        }
        available = available.substr(0, available.length - 1) + "]";
        console.log(available);
    },
    version: function () {
        console.log(pkg.name + ' ' + pkg.version);
    }
};


cli.launch({}, function (env) {
    if (argv._.length && commands[argv._[0]]) {
        commands[argv._[0]]();
    } else {
        commands.help();
        process.exit(1);
    }
});

