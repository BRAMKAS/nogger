const path = require('path');
const Datastore = require('nedb');

const noggerDir = '.nogger';
const home = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
const usersPath = path.resolve(home, noggerDir, 'users.db');
const settingsPath = path.resolve(home, noggerDir, 'settings.db');
const loginsPath = path.resolve(home, noggerDir, 'logins.db');

exports.Users = new Datastore({ filename: usersPath, autoload: true });
exports.Settings = new Datastore({ filename: settingsPath, autoload: true });
exports.Logins = new Datastore({ filename: loginsPath, autoload: true });
