#! /usr/bin/env node

const minimist = require('minimist');
const chalk = require('chalk');
const db = require('../server/db');
const auth = require('../server/auth');
const pkg = require('./../package');
const settings = require('../server/settings');
const server = require('../server/server');

const argv = minimist(process.argv.slice(2));
const Users = db.Users;

const actions = {
  start() {
    if (argv.p || argv.port) {
      settings.setPort(argv.p || argv.port);
    }
    if (argv.f || argv.folder) {
      settings.setFolder(argv.f || argv.folder);
    }
    server.start();
  },
  adduser() {
    auth.register({
      username: argv._[1],
      password: argv._[2],
    })
      .then(() => {
        console.log('success!');
        process.exit();
      })
      .catch((err) => {
        console.log('error:', err.message);
        process.exit();
      });
  },
  listusers() {
    Users.find({}, { username: 1 }, (err, users) => {
      if (err) {
        console.log('error:', err.message);
        process.exit();
      }
      users.forEach((user) => {
        console.log(user.username);
      });
      process.exit();
    });
  },
  removeuser() {
    if (!argv._[1]) {
      console.log('error: provide username');
      process.exit();
    }
    Users.remove({ username: argv._[1] }, (err, numRemoved) => {
      if (numRemoved === 0) {
        console.log('error: user does not exist');
        process.exit();
      }
      console.log('success!');
      process.exit();
    });
  },
  changepw() {
    auth.changePassword({
      username: argv._[1],
      password: argv._[2],
    })
      .then(() => {
        console.log('success!');
        process.exit();
      })
      .catch((err) => {
        console.log('error:', err.message);
        process.exit();
      });
  },
};


function fill(val, length, left, filler) {
  filler = filler || ' ';
  val += '';
  if (val.length > length) {
    return val.substr(0, length);
  }
  const split = length - val.length;
  let result = '';
  if (left) {
    result = val;
    for (let j = 0; j < split; j += 1) {
      result += filler;
    }
    return result;
  }
  let first;
  let second;
  if (split % 2 === 1) {
    first = Math.ceil(split / 2);
    second = Math.floor(split / 2);
  } else {
    first = split / 2;
    second = first;
  }
  for (let i = 0; i < first; i += 1) {
    result += filler;
  }
  result += val;
  for (let i = 0; i < second; i += 1) {
    result += filler;
  }
  return result;
}

function logHelpLine(val) {
  console.log(chalk.cyan('|'), fill(val, 60, true), chalk.cyan('|'));
}

function help() {
  console.log(chalk.cyan('|--HELP--------------------------------------------------------|'));
  logHelpLine('');
  logHelpLine('usage: nogger [action]');
  logHelpLine('');
  logHelpLine('');
  logHelpLine('actions:');
  logHelpLine('');
  logHelpLine(' start                Starts nogger on port 1337 in cwd');
  logHelpLine('  -p, --port <port>      Optional. Port for dashboard.');
  logHelpLine('  -f, --folder <folder>  Optional. Absolute LogFiles folder.');
  logHelpLine('');
  logHelpLine(' adduser <user> <pw>  Adds a user for dashboard login');
  logHelpLine(' listusers            Lists all users in db');
  logHelpLine(' removeuser <user>    Removes an existing user');
  logHelpLine(' changepw <user> <pw> Changes password of existing user');
  logHelpLine('');
  logHelpLine(' -v, --version        Shows current nogger version');
  logHelpLine(' -h, --help           Shows help menu');
  logHelpLine('');
  console.log(chalk.cyan('|--------------------------------------------------------------|'));
}

if (argv.v || argv.version) {
  console.log(`${pkg.name} ${pkg.version}`);
  process.exit();
  return;
}
if (argv.h || argv.helper) {
  help();
  process.exit();
  return;
}

if (!actions[argv._[0]]) {
  console.log('Unknown command');
  help();
  process.exit();
  return;
}

actions[argv._[0]]();

