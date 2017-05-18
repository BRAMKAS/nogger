const path = require('path');
const express = require('express');
const logger = require('morgan');
const api = require('./api');
const settings = require('./settings');

exports.start = () => {
  const production = process.env.NODE_ENV === 'production';
  const port = settings.getPort();
  const publicPath = path.join(__dirname, '..', 'public');

  const app = express();

  app.use(logger('common'));
  app.use(express.static(publicPath));
  app.use('/api', api);
  app.use((req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });

  app.listen(port, () => {
    console.log(`Nogger service listening on port ${port} - env: ${production ? 'production' : 'development'}`);
  });
};
