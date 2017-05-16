const fs = require('fs');
const path = require('path');
const lineReader = require('reverse-line-reader');

exports.readdir = folder => new Promise((resolve, reject) => {
  fs.readdir(folder, (err, contents) => {
    if (err) {
      reject(err);
      return;
    }
    const results = [];
    Promise.all(contents.map(file => new Promise((resolveStat, rejectStat) => {
      fs.stat(path.join(folder, file), (statErr, stat) => {
        if (statErr) {
          rejectStat(statErr);
          return;
        }
        results.push({
          name: file,
          size: stat.size,
          modified: stat.mtime.getTime(),
          birthtime: stat.birthtime.getTime(),
          file: stat.isFile(),
        });
        resolveStat();
      });
    }))).then(() => {
      resolve(results);
    });
  });
});

exports.tail = (file, options) => new Promise((resolve, reject) => {
  options = options || {};
  const limit = options.limit || 100;
  let search = options.search || '';
  const skip = options.skip || 0;
  const before = options.before || 0;
  const after = options.after || 0;
  let regex;
  if (options.regex) {
    try {
      regex = new RegExp(search, options.caseSensitive ? '' : 'i');
    } catch (e) {
      reject();
      return;
    }
  } else {
    search = search.toLowerCase();
  }

  const found = [];
  let lookbeforeBuffer = [];
  let total = 0;
  let skipped = 0;
  let match;
  let used;
  let matchAfter = 0;
  let usedCount = 0;

  lineReader.eachLine(file, (rawLine, last) => {
    const line = rawLine.replace('\r', '').replace('\n', '');
    if (!line) {
      if (last) {
        resolve({ contents: found.reverse(), total });
      }
      return true;
    }
    total += 1;
    match = false;
    used = false;
    if (regex) {
      match = line.match(regex);
    } else {
      match = line.toLowerCase().indexOf(search) !== -1;
    }
    if (match || matchAfter) {
      if (skipped < skip) {
        skipped += 1;
      } else {
        if (lookbeforeBuffer.length) {
          lookbeforeBuffer.forEach((beforeLine) => {
            found.push({ v: beforeLine, before: true });
          });
          lookbeforeBuffer = [];
        }
        found.push({ v: line });
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
      resolve({ contents: found.reverse(), total: null });
      return false;
    }

    if (last) {
      resolve({ contents: found.reverse(), total });
    } else if (before && !used) {
      lookbeforeBuffer.push(line);
      if (lookbeforeBuffer.length > before) {
        lookbeforeBuffer.splice(0, 1);
      }
    }
    return true;
  });
});
