var fs = require('fs')
var rimraf = require('rimraf')
var assert = require('assert')
var VCR = require('../index')

function clearFixtures() {
  rimraf.sync('./test/fixtures')
}

function fileExists(path) {
  try {
    return fs.statSync(path).isFile()
  } catch(e) {
    return false
  }
}

function getContents(cassettePath, config) {
  var loadAt = require('../lib/jsonDb').loadAt
  var digest = require('../lib/digest')
  var key = digest(config)

  return loadAt(cassettePath, key)
}

describe('Axios VCR', function() {
  this.timeout(5000)
  var posts = 'http://jsonplaceholder.typicode.com/posts/1'
  var axios = require('axios')

  describe('recording', function() {
    beforeEach(clearFixtures)
    afterEach(clearFixtures)

    it('generates stubs for requests', function(done) {
      var path = './test/fixtures/posts.json'
      VCR.useCassette(path, function () {
        axios.get(posts).then(function(response) {
          getContents(path, response.config).then(function(contents) {
            assert.deepEqual(contents.originalResponseData.data, response.data)
            done()
          })
        })
      })
    })

    it('works with nested folders', function(done) {
      var cassettePath = './test/fixtures/nested/posts.json'
      VCR.useCassette(cassettePath, function () {
        axios.get(posts).then(function(response) {
          getContents(cassettePath, response.config).then(function(contents) {
            assert.deepEqual(contents.originalResponseData.data, response.data)
            done()
          })
        }).catch(function(err) { console.log(err) })
      })
    })

    it('stores headers and status', function(done) {
      var cassettePath = './test/fixtures/posts.json'
      VCR.useCassette(cassettePath, function () {
        axios.get(posts).then(function(response) {
          getContents(cassettePath, response.config).then(function(contents) {
            assert.deepEqual(contents.originalResponseData.headers, response.headers)
            assert.equal(contents.originalResponseData.status, response.status)
            assert.equal(contents.originalResponseData.statusText, response.statusText)
            done()
          })
        })
      })
    })
  })

  describe('replaying', function() {
    /*
      This is a tricky test.
      I'm not aware of any way to check that a network request has been made.
      So instead we hit an unexisting URL that is backed by a cassette. We can now
      check that the response is the same as the cassette file.
    */
    it('skips remote calls', function(done) {
      var path = './test/static_fixtures/posts.json'
      assert(fileExists(path))

      var url = 'http://something.com/unexisting'

      VCR.useCassette(path, function () {
        axios.get(url).then(function(res) {
          getContents(path, res.config).then(function(contents) {
            assert.deepEqual(contents.originalResponseData, res)
            done()
          })
        })
      })
    })

    it('makes remote call when a cassette is not available', function(done) {
      var path = './test/static_fixtures/no_posts.json'

      try {
        fs.unlinkSync(path)
      } catch(e) {}

      assert(!fileExists(path))

      VCR.useCassette(path, function () {
        axios.get(posts).then(function(response) {
          assert.equal(200, response.status)
          fs.unlinkSync(path)
          done()
        })
      })
    })
  })
})
