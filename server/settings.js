const settings = {
  folder: process.cwd(),
  port: 1337,
};

exports.setFolder = folder => (settings.folder = folder);
exports.setPort = port => (settings.port = port);

exports.getFolder = () => settings.folder;
exports.getPort = () => settings.port;
