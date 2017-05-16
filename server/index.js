const minimist = require('minimist');
const server = require('./server');
const settings = require('./settings');

const argv = minimist(process.argv.slice(2));

if (argv.f || argv.folder) {
  settings.setFolder(argv.f || argv.folder);
}
if (argv.p || argv.port) {
  settings.setPort(argv.p || argv.port);
}

server.start();
