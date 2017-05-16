const fs = require('fs');
const lineReader = require('reverse-line-reader');

exports.readdir = folder => new Promise((resolve, reject) => {
  fs.readdir(folder, (err, contents) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(contents);
  });
});

exports.tail = (file, options) => new Promise((resolve, reject) => {
  options = options || {};
  const limit = options.limit || 100;
  const filter = options.filter || '';
  const skip = options.skip || 0;
  const before = options.before || 0;
  const after = options.after || 0;
  let regex;
  if (options.regex) {
    try {
      regex = new RegExp(filter, options.caseSensitive ? '' : 'i');
    } catch (e) {
      reject();
      return;
    }
  }

  const found = [];
  let lookbeforeBuffer = [];
  let total = 0;
  let skipped = 0;
  let match;
  let used;
  let matchAfter = 0;
  let usedCount = 0;

  lineReader.eachLine(file, (line, last) => {
    total += 1;
    match = false;
    used = false;
    if (total > skip) {
      if (regex) {
        match = line.match(regex);
      } else {
        match = line.toLowerCase().indexOf(filter) !== -1;
      }

      if (match || matchAfter) {
        if (skipped < skip) {
          skipped += 1;
        } else {
          if (lookbeforeBuffer.length) {
            lookbeforeBuffer.forEach((beforeLine) => {
              found.push(beforeLine);
            });
            lookbeforeBuffer = [];
          }
          found.push(line);
          if (match) {
            usedCount += 1;
          }
          used = true;
          if (after && match) {
            matchAfter = after;
          } else if (matchAfter) {
            matchAfter -= 1;
          }
        }
      }
      if (usedCount >= limit && !matchAfter) {
        resolve({ result: found });
        return false;
      }
    }
    if (last) {
      resolve({ resolve: found, total });
    } else if (before && !used) {
      lookbeforeBuffer.push(line);
      if (lookbeforeBuffer.length > before) {
        lookbeforeBuffer.splice(0, 1);
      }
    }
    return true;
  });
});
