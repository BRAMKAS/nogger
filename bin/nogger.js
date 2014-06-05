#!/usr/bin/env node
'use strict';

var Liftoff = require('liftoff');
var child_process = require('child_process');
var chalk = require('chalk');
var argv = require('minimist')(process.argv.slice(2));
var cli = new Liftoff({
    name: 'nogger',
    moduleName: 'nogger',
    processTitle: 'nogger'
});

var runnning = false;

var commands = {
    start: function(){
        console.log('start called');
        child_process.spawn('../back/server');
        //require('../back/server');
        //process.disconnect();
    },
    stop: function(){
        console.log('stop called');
        child_process.execFile('pkill', ['nogger'], function(err, stdout, stderr){
            if (stdout){console.log('stdout:'+stdout);
                if (stderr){console.log('stderr:'+stderr);
                    if (err){throw err;}
                    //...
                }
            }
        });
    },
    setpassword: function(){
        console.log('setpassword called');
    },
    help: function(){
        console.log('------ help ------');
        for(var i in commands){
            console.log(i);
        }
    }
};


cli.launch({},function(env){
    if(argv._.length && commands[argv._[0]]){
        commands[argv._[0]]();
    } else {
        commands.help();
        process.exit(1);
    }
});


