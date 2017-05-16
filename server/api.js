const express = require('express');
const bodyParser = require('body-parser');
const reader = require('./reader');
const settings = require('./settings');
const auth = require('./auth');

const api = express();
api.use(bodyParser.json());

api.post('/login', (req, res) => auth.login(req.body)
  .then(() => res.json({ success: true }))
  .catch((err) => {
    if (err.message.indexOf('Auth -') === 0) {
      res.json({ success: false });
    } else {
      console.log('Error logging in', err);
      res.status(400).send('Error logging in - check your nogger logs for more information');
    }
  }));

api.get('/folder', (req, res) =>
  settings.getFolder()
    .then(folder => reader.readdir(folder))
    .then(contents => res.json(contents))
    .catch((err) => {
      console.log('Error reading folder', err);
      res.status(400).send('Error reading folder - check your nogger logs for more information');
    }));

api.get('/file/:file', (req, res) =>
  settings.getFolder()
    .then(folder => reader.tail(`${folder}/${req.params.file}`, req.query))
    .then(lines => res.json(lines))
    .catch((err) => {
      console.log('Error reading file', err);
      res.status(400).send('Error reading file - check your nogger logs for more information');
    }));

module.exports = api;
