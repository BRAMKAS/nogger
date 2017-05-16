const path = require('path');
const express = require('express');
const logger = require('morgan');
const minimist = require('minimist');
const api = require('./api');

const argv = minimist(process.argv.slice(2));
const production = process.env.NODE_ENV === 'production';
const port = argv.p || argv.port || 1337;
const publicPath = path.join(__dirname, '..', 'public');

const app = express();

app.use(logger(production ? 'common' : 'dev'));
app.use(express.static(publicPath));
app.use('/api', api);
app.use((req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
