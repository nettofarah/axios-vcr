/* eslint-disable func-names */
const fs = require('fs');
const rimraf = require('rimraf');
const assert = require('assert');
const VCR = require('../index');
const _ = require('lodash');
const axios = require('axios');

const { loadAt } = require('../lib/jsonDb');
const digest = require('../lib/digest');

function clearFixtures() {
  rimraf.sync('./test/fixtures');
}

function fileExists(path) {
  try {
    return fs.statSync(path).isFile();
  } catch (e) {
    return false;
  }
}

function getFixture(cassettePath, config) {
  const key = digest(config);

  return loadAt(cassettePath, key);
}

describe('Axios VCR', function () {
  this.timeout(10000);

  const posts = 'http://jsonplaceholder.typicode.com/posts/1';

  describe('recording', () => {
    beforeEach(clearFixtures);
    afterEach(clearFixtures);

    it('generates stubs for requests', () => {
      const path = './test/fixtures/posts.json';
      VCR.mountCassette(path);

      return axios.get(posts).then(response =>
        getFixture(path, response.config)
          .then((fixture) => {
            assert.deepEqual(fixture.originalResponseData.data, response.data);
          })).finally(() => VCR.ejectCassette(path));
    });

    it('works with nested folders', () => {
      const cassettePath = './test/fixtures/nested/posts.json';
      VCR.mountCassette(cassettePath);

      return axios
        .get(posts)
        .then(response =>
          getFixture(cassettePath, response.config)
            .then((fixture) => {
              assert.deepEqual(fixture.originalResponseData.data, response.data);
            }))
        .finally(() => {
          VCR.ejectCassette(cassettePath);
        });
    });

    it('stores headers and status', () => {
      const cassettePath = './test/fixtures/posts.json';
      VCR.mountCassette(cassettePath);

      return axios.get(posts).then(response =>
        getFixture(cassettePath, response.config).then((fixture) => {
          assert.deepEqual(
            fixture.originalResponseData.headers,
            response.headers,
          );
          assert.equal(fixture.originalResponseData.status, response.status);
          assert.equal(
            fixture.originalResponseData.statusText,
            response.statusText,
          );
        })).finally(() => VCR.ejectCassette(cassettePath));
    });
  });

  describe('replaying', () => {
    /*
      This is a tricky test.
      I'm not aware of any way to check that a network request has been made.
      So instead we hit an unexisting URL that is backed by a cassette. We can now
      check that the response is the same as the cassette file.
    */
    it('skips remote calls', () => {
      const path = './test/static_fixtures/posts.json';
      assert(fileExists(path));

      const url = 'http://something.com/unexisting';
      VCR.mountCassette(path);

      return axios
        .get(url)
        .then(res =>
          getFixture(path, res.config)
            .then((fixture) => {
              assert.deepEqual(
                fixture.originalResponseData,
                _.omit(res, 'fixture'),
              );
            })).finally(() => VCR.ejectCassette(path));
    });

    it('makes remote call when a cassette is not available', () => {
      const path = './test/static_fixtures/no_posts.json';

      try {
        fs.unlinkSync(path);
      } catch (e) {
        // Do nothing
      }

      assert(!fileExists(path));
      VCR.mountCassette(path);

      return axios.get(posts).then((response) => {
        assert.equal(200, response.status);
      }).finally(() => {
        fs.unlinkSync(path);
        VCR.ejectCassette(path);
      });
    });
  });

  describe('Multiple Requests', function () {
    this.timeout(15000);

    beforeEach(clearFixtures);
    afterEach(clearFixtures);

    const usersUrl = 'http://jsonplaceholder.typicode.com/users';
    const todosUrl = 'http://jsonplaceholder.typicode.com/todos';

    it('stores multiple requests in the same cassette', (done) => {
      const path = './test/fixtures/multiple.json';

      VCR.mountCassette(path);

      const usersPromise = axios.get(usersUrl);
      const todosPromise = axios.get(todosUrl);

      Promise.all([usersPromise, todosPromise]).then((responses) => {
        const usersResponse = responses[0];
        const todosResponse = responses[1];

        const usersResponsePromise = getFixture(path, usersResponse.config);
        const todosResponsePromise = getFixture(path, todosResponse.config);

        Promise.all([usersResponsePromise, todosResponsePromise]).then((fixtures) => {
          assert.deepEqual(
            fixtures[0].originalResponseData.data,
            usersResponse.data,
          );
          assert.deepEqual(
            fixtures[1].originalResponseData.data,
            todosResponse.data,
          );
          done();

          VCR.ejectCassette(path);
        });
      });
    });
  });
});
