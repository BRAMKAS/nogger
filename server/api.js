const express = require('express');
const bodyParser = require('body-parser');
const reader = require('./reader');
const settings = require('./settings');

const api = express();
api.use(bodyParser.json());

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
