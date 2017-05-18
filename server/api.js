const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const nedbSession = require('nedb-session-store');
const request = require('request-promise');
const reader = require('./reader');
const settings = require('./settings');
const auth = require('./auth');
const db = require('./db');


const NedbStore = nedbSession(session);
const api = express();
api.use(bodyParser.json());

api.use(session({
  secret: 'cookieSecretDeluxe',
  resave: false,
  saveUninitialized: false,
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 10 * 24 * 60 * 60 * 1000,
  },
  store: new NedbStore({
    filename: db.generateDbPath('session'),
  }),
}));

function checkAuth(req, res, next) {
  if (req.session.auth) {
    next();
  } else {
    res.status(401).send('Not authenticated');
  }
}

api.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log('error destroying session', err);
      res.json({ success: false });
    } else {
      res.json({ success: true });
    }
  });
});

api.post('/login', (req, res) => auth.login(req.body)
  .then(() => {
    req.session.auth = req.body.username;
    res.json({ success: true });
  })
  .catch((err) => {
    if (err.message.indexOf('Auth -') === 0) {
      res.json({ success: false, errorText: err.message });
    } else {
      console.log('Error logging in', err);
      res.status(400).send('Error logging in - check your nogger logs for more information');
    }
  }));

api.get('/latest-version', (req, res) => {
  request({
    uri: 'https://registry.npmjs.org/nogger/latest',
    json: true,
  })
    .then((re) => {
      res.json({ success: true, version: re.version });
    })
    .catch((err) => {
      console.log('Error loading latest version', err);
      res.json({ success: false });
    });
});

api.get('/check-auth', (req, res) => {
  res.json({ auth: !!(req.session && req.session.auth) });
});

api.get('/folder', checkAuth, (req, res) =>
  reader.readdir(settings.getFolder())
    .then(contents => res.json(contents))
    .catch((err) => {
      console.log('Error reading folder', err);
      res.status(400).send('Error reading folder - check your nogger logs for more information');
    }));

api.get('/file/:file', checkAuth, (req, res) =>
  reader.tail(`${settings.getFolder()}/${req.params.file}`, req.query)
    .then(lines => res.json(lines))
    .catch((err) => {
      console.log('Error reading file', err);
      res.status(400).send('Error reading file - check your nogger logs for more information');
    }));

module.exports = api;
