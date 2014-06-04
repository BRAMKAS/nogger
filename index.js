#!/usr/bin/env node

// start server
require('./back/server');

var Liftoff = require('liftoff');
var chalk = require('chalk');
var argv = require('minimist')(process.argv.slice(2));
var cli = new Liftoff({
    name: 'nogger',
    moduleName: 'nogger',
    processTitle: 'nogger',
    configName: 'noggerfile'
});

cli.on('require', function(name) {
    console.log('Requiring external module', chalk.magenta(name));
});

cli.launch({
    cwd: argv.cwd,
    configPath: argv.noggerfile,
    require: argv.require,
    completion: argv.completion
},function(env){
    console.log('Launch', chalk.magenta(env));

    if (!env.modulePath) {
       console.log('no locaal install found');
        process.exit(1);
    }

    if (!env.configPath) {
        console.log('no noggerfile found');
        process.exit(1);
    }
});


exports.adapter = require('nogger-node-adapter');
