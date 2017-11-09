const assert = require('assert');
const rimraf = require('rimraf');

const jsonDB = require('../lib/jsonDb');
const { writeJson } = require('../lib/readWriteJson');


function clearFixtures() {
  rimraf.sync('./test/jdb/*');
}

describe('JsonDB', () => {
  afterEach(clearFixtures);

  describe('loadAt', () => {
    const path = './test/jdb/temp.json';

    beforeEach(() =>
      writeJson(path, {
        a: {
          b: {
            c: 'it works!',
          },
        },
      }));

    it('loads an object from a JSON stored in a file', () =>
      jsonDB.loadAt(path).then((payload) => {
        assert.deepEqual(payload, {
          a: {
            b: {
              c: 'it works!',
            },
          },
        });
      }));

    it('accepts nested paths', () =>
      jsonDB.loadAt(path, 'a.b.c').then((payload) => {
        assert.equal(payload, 'it works!');
      }));

    it('fails when the file does not exist', () =>
      jsonDB.loadAt('./test/jdb/unexisting.json').catch((error) => {
        assert.equal(error.code, 'ENOENT');
      }));

    it('fails when the json path does not exist', () =>
      jsonDB.loadAt('./test/jdb/temp.json', 'a.b.c.d').catch((error) => {
        assert.deepEqual(error, new Error('Invalid JSON Path'));
      }));
  });

  describe('writeAt', () => {
    const path = './test/jdb/temp_write.json';

    beforeEach(() =>
      writeJson(path, {
        a: {
          b: {},
        },
      }));

    it('writes at a given path', () => {
      const time = new Date().getTime();
      const payload = { c: 'Axios VCR', time };

      return jsonDB.writeAt(path, 'a.b', payload).then(() => {
        jsonDB.loadAt(path, 'a.b').then((json) => {
          assert.deepEqual(payload, json);
        });
      });
    });

    it('creates missing keys', () => {
      const payload = 'nested stuff';
      return jsonDB.writeAt(path, 'a.b.c.d.e', payload).then(() => {
        jsonDB.loadAt(path, 'a.b.c.d.e').then((json) => {
          assert.deepEqual(payload, json);
        });
      });
    });

    it('creates missing parts of the path', () => {
      const tempWritePath = './test/jdb/nested/temp_write.json';
      const payload = 'something';

      return jsonDB.writeAt(tempWritePath, 'a', payload).then(() => {
        jsonDB.loadAt(tempWritePath, 'a').then((json) => {
          assert.deepEqual(payload, json);
        });
      });
    });
  });
});
