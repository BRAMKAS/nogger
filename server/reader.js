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
  let search = options.search || '';
  const limit = parseInt(options.limit, 10) || 100;
  const skip = parseInt(options.skip, 10) || 0;
  const before = parseInt(options.before, 10) || 0;
  const after = parseInt(options.after, 10) || 0;
  const caseSensitive = options.caseSensitive && options.caseSensitive !== 'false';
  const useRegex = options.regex && options.regex !== 'false';

  let regex;
  if (useRegex) {
    try {
      regex = new RegExp(search, caseSensitive ? '' : 'i');
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
        if (matchAfter && !match) {
          found.push({ v: line, after: true });
        } else {
          found.push({ v: line });
        }
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
