var fs = require('fs');
var rimraf = require('rimraf');
var assert = require('assert');
var VCR = require('../index');

function clearFixtures() {
  rimraf.sync('./test/fixtures');
}

function fileExists(path) {
  try {
    return fs.statSync(path).isFile();
  } catch(e) {
    return false
  }
}

describe('Axios VCR', function() {
  this.timeout(10000);
  var cats = 'https://reddit.com/r/cats.json';
  var axios = require('axios');

  describe('recording', function() {
    beforeEach(clearFixtures);
    afterEach(clearFixtures);

    it('generates stubs for requests', function(done) {
      VCR.useCassette('./test/fixtures/cats.json', function () {
        axios.get(cats).then(function(response) {
          var contents = JSON.parse(fs.readFileSync('./test/fixtures/cats.json'));
          assert.deepEqual(contents.data, response.data);
          done();
        });
      });
    });

    it('works with nested folders', function(done) {
      var cassettePath = './test/fixtures/reddit/r/cats.json';
      VCR.useCassette(cassettePath, function () {
        axios.get(cats).then(function(response) {
          var contents = JSON.parse(fs.readFileSync(cassettePath));
          assert.deepEqual(contents.data, response.data);
          done();
        }).catch(function(err) { console.log(err); done(); });
      });
    });

    it('stores headers and status', function(done) {
      var cassettePath = './test/fixtures/cats.json';
      VCR.useCassette(cassettePath, function () {
        axios.get(cats).then(function(response) {
          var contents = JSON.parse(fs.readFileSync(cassettePath));

          assert.deepEqual(contents.headers, response.headers);
          assert.equal(contents.status, response.status);
          assert.equal(contents.statusText, response.statusText);

          done();
        });
      });
    });
  });

  describe('replaying', function() {
    /*
      This is a tricky test.
      I'm not aware of any way to check that a network request has been made.
      So instead we hit an unexisting URL that is backed by a cassette. We can now
      check that the response is the same as the cassette file.
    */
    it('skips remote calls', function(done) {
      var path = './test/static_fixtures/cats.json';
      assert(fileExists(path));

      VCR.useCassette(path, function () {
        axios.get('http://something.com/unexisting').then(function(response) {
          var contents = JSON.parse(fs.readFileSync(path));
          assert.deepEqual(response.data, contents.data);
          done();
        });
      });
    });

    it('makes remote call when a cassette is not available', function(done) {
      var path = './test/static_fixtures/no_cats.json';

      try {
        fs.unlinkSync(path);
      } catch(e) {}

      assert(!fileExists(path));

      VCR.useCassette(path, function () {
        axios.get(cats).then(function(response) {
          assert.equal(200, response.status);
          done();
        });
      });
    })
  });
});
