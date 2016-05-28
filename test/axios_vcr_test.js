var fs = require('fs');
var rimraf = require('rimraf');
var assert = require('assert');
var VCR = require('../index');

function clearFixtures() {
  rimraf.sync('./test/fixtures');
}

describe('Axios VCR', function() {
  this.timeout(10000);
  var cats = 'https://reddit.com/r/cats.json';
  var axios = require('axios');

  describe('recording', function() {
    beforeEach(clearFixtures);
    afterEach(clearFixtures);

    it('generates stubs for requests', function(done) {
      VCR.useCassete('./test/fixtures/cats.json', function () {
        axios.get(cats).then(function(response) {
          var contents = JSON.parse(fs.readFileSync('./test/fixtures/cats.json'));
          assert.deepEqual(contents.data, response.data);
          done();
        }).catch(function(err) { console.log(err); done(); });
      });
    });

    it('works with nested folders', function(done) {
      var cassetePath = './test/fixtures/reddit/r/cats.json';
      VCR.useCassete(cassetePath, function () {
        axios.get(cats).then(function(response) {
          var contents = JSON.parse(fs.readFileSync(cassetePath));
          assert.deepEqual(contents.data, response.data);
          done();
        }).catch(function(err) { console.log(err); done(); });
      });
    });

    it('stores headers and status', function(done) {
      var cassetePath = './test/fixtures/cats.json';
      VCR.useCassete(cassetePath, function () {
        axios.get(cats).then(function(response) {
          var contents = JSON.parse(fs.readFileSync(cassetePath));

          assert.deepEqual(contents.headers, response.headers);
          assert.equal(contents.status, response.status);
          assert.equal(contents.statusText, response.statusText);

          done();
        }).catch(function(err) { console.log(err); done(); });
      });
    });
  });
});
