const expect = require('expect.js');
const path = require('path');
const reader = require('../server/reader');

const scriptName = path.basename(__filename);

describe('server reader', () => {
  describe('readdir', () => {
    it('should read a directory sucessfully', () =>
      reader.readdir(__dirname)
        .then((result) => {
          expect(result).to.be.ok();
          expect(result.find(item => item.name === scriptName)).to.be.ok();
        })
        .catch((e) => {
          throw e;
        }));
  });

  describe('tail', () => {
    it('should read all lines of a small logfile', () =>
      reader.tail(path.resolve(__dirname, 'testLogs', 'log1'))
        .then((result) => {
          expect(result).to.be.ok();
          expect(result.contents.length).to.eql(6);
          expect(result.total).to.eql(6);
        })
        .catch((e) => {
          throw e;
        }));

    it('should find the one matching search result', () =>
      reader.tail(path.resolve(__dirname, 'testLogs', 'log1'), { search: 'wpaper.gif' })
        .then((result) => {
          expect(result).to.be.ok();
          expect(result.contents.length).to.eql(1);
          expect(result.contents[0].v.indexOf('wpaper.gif')).not.to.eql(-1);
          expect(result.total).to.eql(6);
        })
        .catch((e) => {
          throw e;
        }));

    it('should find the one matching search result even with wrong case', () =>
      reader.tail(path.resolve(__dirname, 'testLogs', 'log1'), { search: 'wPAPER.gif' })
        .then((result) => {
          expect(result).to.be.ok();
          expect(result.contents.length).to.eql(1);
          expect(result.contents[0].v.indexOf('wpaper.gif')).not.to.eql(-1);
          expect(result.total).to.eql(6);
        })
        .catch((e) => {
          throw e;
        }));

    it('should find the one matching search result even with wrong case in log file', () =>
      reader.tail(path.resolve(__dirname, 'testLogs', 'log1'), { search: 'wpaper.gif http/1.0' })
        .then((result) => {
          expect(result).to.be.ok();
          expect(result.contents.length).to.eql(1);
          expect(result.contents[0].v.indexOf('wpaper.gif http/1.0')).to.eql(-1);
          expect(result.contents[0].v.toLowerCase().indexOf('wpaper.gif http/1.0')).not.to.eql(-1);
          expect(result.total).to.eql(6);
        })
        .catch((e) => {
          throw e;
        }));

    it('should find the one matching search result and include one before', () =>
      reader.tail(path.resolve(__dirname, 'testLogs', 'log1'), { search: 'wpaper.gif', before: 1 })
        .then((result) => {
          expect(result).to.be.ok();
          expect(result.contents.length).to.eql(2);
          expect(result.contents[0].v.indexOf('wpaper.gif')).not.to.eql(-1);
          expect(result.total).to.eql(6);
        })
        .catch((e) => {
          throw e;
        }));

    it('should find the one matching search result and include one after', () =>
      reader.tail(path.resolve(__dirname, 'testLogs', 'log1'), { search: 'newcount', after: 1 })
        .then((result) => {
          expect(result).to.be.ok();
          expect(result.contents.length).to.eql(2);
          expect(result.contents[1].v.indexOf('newcount')).not.to.eql(-1);
          expect(result.total).to.eql(6);
        })
        .catch((e) => {
          throw e;
        }));

    it('should find the one matching search result and include none after, because there it is first line', () =>
      reader.tail(path.resolve(__dirname, 'testLogs', 'log1'), { search: 'wpaper.gif', after: 1 })
        .then((result) => {
          expect(result).to.be.ok();
          expect(result.contents.length).to.eql(1);
          expect(result.contents[0].v.indexOf('wpaper.gif')).not.to.eql(-1);
          expect(result.total).to.eql(6);
        })
        .catch((e) => {
          throw e;
        }));

    it('should find the one matching search result and include none before, because there it is last line', () =>
      reader.tail(path.resolve(__dirname, 'testLogs', 'log1'), { search: 'newcount', before: 1 })
        .then((result) => {
          expect(result).to.be.ok();
          expect(result.contents.length).to.eql(1);
          expect(result.contents[0].v.indexOf('newcount')).not.to.eql(-1);
          expect(result.total).to.eql(6);
        })
        .catch((e) => {
          throw e;
        }));

    it('should skip no results', () =>
      reader.tail(path.resolve(__dirname, 'testLogs', 'log1'), { skip: 0 })
        .then((result) => {
          expect(result).to.be.ok();
          expect(result.contents.length).to.eql(6);
          expect(result.total).to.eql(6);
        })
        .catch((e) => {
          throw e;
        }));

    it('should skip the first two results', () =>
      reader.tail(path.resolve(__dirname, 'testLogs', 'log1'), { skip: 2 })
        .then((result) => {
          expect(result).to.be.ok();
          expect(result.contents.length).to.eql(4);
          expect(result.contents.find(item => item.v.indexOf('newcount') !== -1)).not.to.be.ok();
          expect(result.total).to.eql(6);
        })
        .catch((e) => {
          throw e;
        }));

    it('should skip all', () =>
      reader.tail(path.resolve(__dirname, 'testLogs', 'log1'), { skip: 200 })
        .then((result) => {
          expect(result).to.be.ok();
          expect(result.contents.length).to.eql(0);
          expect(result.total).to.eql(6);
        })
        .catch((e) => {
          throw e;
        }));

    it('should limit the results to 3 and not return total', () =>
      reader.tail(path.resolve(__dirname, 'testLogs', 'log1'), { limit: 3 })
        .then((result) => {
          expect(result).to.be.ok();
          expect(result.contents.length).to.eql(3);
          expect(result.total).not.to.eql(6);
        })
        .catch((e) => {
          throw e;
        }));

    it('should ignore the too high limit and just return all', () =>
      reader.tail(path.resolve(__dirname, 'testLogs', 'log1'), { limit: 300 })
        .then((result) => {
          expect(result).to.be.ok();
          expect(result.contents.length).to.eql(6);
          expect(result.total).to.eql(6);
        })
        .catch((e) => {
          throw e;
        }));

    it('should use regex', () =>
      reader.tail(path.resolve(__dirname, 'testLogs', 'log1'), { search: '([A-Z])\\w+', regex: true })
        .then((result) => {
          expect(result).to.be.ok();
          expect(result.contents.length).to.eql(6);
          expect(result.total).to.eql(6);
        })
        .catch((e) => {
          throw e;
        }));

    it('should use regex without case sensitive', () =>
      reader.tail(path.resolve(__dirname, 'testLogs', 'log1'), { search: 'get', regex: true, caseSensitive: false })
        .then((result) => {
          expect(result).to.be.ok();
          expect(result.contents.length).to.eql(6);
          expect(result.total).to.eql(6);
        })
        .catch((e) => {
          throw e;
        }));

    it('should use regex with case sensitive', () =>
      reader.tail(path.resolve(__dirname, 'testLogs', 'log1'), { search: 'get', regex: true, caseSensitive: true })
        .then((result) => {
          expect(result).to.be.ok();
          expect(result.contents.length).to.eql(0);
          expect(result.total).to.eql(6);
        })
        .catch((e) => {
          throw e;
        }));

    it('should also work with a weird log file', () =>
      reader.tail(path.resolve(__dirname, 'testLogs', 'weirdLog'))
        .then((result) => {
          expect(result).to.be.ok();
          expect(result.contents.length).to.eql(7);
          expect(result.total).to.eql(7);
        })
        .catch((e) => {
          throw e;
        }));

    it('should not work properly with zip', () =>
      reader.tail(path.resolve(__dirname, 'testLogs', 'weirdLog.zip'))
        .then((result) => {
          expect(result).to.be.ok();
          expect(result.contents.length).not.to.eql(7);
          expect(result.total).not.to.eql(7);
        })
        .catch((e) => {
          throw e;
        }));

    it('should not work properly with tar', () =>
      reader.tail(path.resolve(__dirname, 'testLogs', 'weirdLog.tar'))
        .then((result) => {
          expect(result).to.be.ok();
          expect(result.contents.length).not.to.eql(7);
          expect(result.total).not.to.eql(7);
        })
        .catch((e) => {
          throw e;
        }));
  });
});
