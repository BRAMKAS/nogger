const bcrypt = require('bcryptjs');
const db = require('./db');

const Users = db.Users;
const Logins = db.Logins;
const saltRounds = 12;
const maxLoginAttempts = 10;
const loginAttemptCountTimeout = 5 * 60 * 1000;

exports.login = data => new Promise((resolve, reject) => {
  if (!data || !data.email || !data.password) {
    reject(new Error('Auth - No email or password provided'));
    return;
  }
  const email = data.email.toLowerCase();

  Logins.count(
    {
      email,
      date: {
        $gt: Date.now() - loginAttemptCountTimeout,
      },
    },
    (loginsErr, logins) => {
      if (loginsErr) {
        console.log('error checking login attempts', loginsErr);
      } else if (logins > maxLoginAttempts) {
        reject(new Error('Auth - too many logins. Try again later'));
      }
      Users.findOne({ email }, (err, user) => {
        if (err) {
          reject(err);
          return;
        }
        bcrypt.compare(data.password, user.password, (hashErr, success) => {
          if (hashErr) {
            reject(hashErr);
            return;
          }
          if (success) {
            resolve(user);
          } else {
            reject(new Error('Auth - Wrong password'));
          }
        });
      });

      Logins.insert({
        email,
        date: Date.now(),
      }, (err) => {
        if (err) {
          console.log('error saving login attempt', err);
        }
      });
    });
})
;

exports.register = data => new Promise((resolve, reject) => {
  if (!data || !data.email || !data.password) {
    reject(new Error('Register - No email or password provided'));
    return;
  }
  const email = data.email.toLowerCase();

  bcrypt.hash(data.password, saltRounds, (err, hash) => {
    if (err) {
      reject(err);
      return;
    }
    Users.insert({
      email: data.email,
      password: hash,
    }, (insertErr) => {
      if (insertErr) {
        reject(insertErr);
        return;
      }
      resolve();
    });
  });
});
