const Settings = require('./db').Settings;

exports.getFolder = () => new Promise((resolve) => {
  Settings.findOne({ _id: 'v3' }, (err, settings) => {
    let folder = process.cwd();
    if (settings && settings.folder) {
      folder = settings.folder;
    }
    resolve(folder);
  });
});
