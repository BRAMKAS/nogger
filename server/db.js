const path = require('path');
const Datastore = require('nedb');

const noggerDir = '.nogger';
const home = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
exports.generateDbPath = name => path.resolve(home, noggerDir, `${name}.db`);

exports.Users = new Datastore({
  filename: exports.generateDbPath('users'),
  autoload: true,
});
exports.Logins = new Datastore({
  filename: exports.generateDbPath('logins'),
  autoload: true,
});
