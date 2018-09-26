var fs = require('fs')
var rimraf = require('rimraf')
var assert = require('assert')
var VCR = require('../index')
var _ = require('lodash')

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

function getFixture(cassettePath, config) {
  var loadAt = require('../lib/jsonDb').loadAt
  var digest = require('../lib/digest')
  var key = digest(config)

  return loadAt(cassettePath, key)
}

describe('Axios VCR', function() {
  this.timeout(10000)
  var posts = 'http://jsonplaceholder.typicode.com/posts/1'
  var axios = require('axios')

  describe('recording', function() {
    beforeEach(clearFixtures)
    afterEach(clearFixtures)

    it('generates stubs for requests', function(done) {
      var path = './test/fixtures/posts.json'
      VCR.mountCassette(path)

      axios.get(posts).then(function(response) {
        return getFixture(path, response.config).then(function(fixture) {
          assert.deepEqual(fixture.originalResponseData.data, response.data)
          done()
          VCR.ejectCassette(path)
        })
      }).catch(function(err) { console.log(err); done() })
    })

    it('works with nested folders', function(done) {
      var cassettePath = './test/fixtures/nested/posts.json'
      VCR.mountCassette(cassettePath)

      axios.get(posts).then(function(response) {
        return getFixture(cassettePath, response.config).then(function(fixture) {
          assert.deepEqual(fixture.originalResponseData.data, response.data)
          done()

          VCR.ejectCassette(cassettePath)
        })
      }).catch(function(err) { console.log(err); done() })
    })

    it('stores headers and status', function(done) {
      var cassettePath = './test/fixtures/posts.json'
      VCR.mountCassette(cassettePath)

      axios.get(posts).then(function(response) {
        return getFixture(cassettePath, response.config).then(function(fixture) {
          assert.deepEqual(fixture.originalResponseData.headers, response.headers)
          assert.equal(fixture.originalResponseData.status, response.status)
          assert.equal(fixture.originalResponseData.statusText, response.statusText)
          done()

          VCR.ejectCassette(cassettePath)
        })
      }).catch(function(err) { console.log(err); done() })
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
      VCR.mountCassette(path)

      axios.get(url).then(function(res) {
        return getFixture(path, res.config).then(function(fixture) {
          assert.deepEqual(fixture.originalResponseData, _.omit(res, 'fixture'))
          done()

          VCR.ejectCassette(path)
        }).catch(err => { console.log(err); done() })
      })
    })

    it('makes remote call when a cassette is not available', function(done) {
      var path = './test/static_fixtures/no_posts.json'

      try {
        fs.unlinkSync(path)
      } catch(e) {}

      assert(!fileExists(path))
      VCR.mountCassette(path)

      axios.get(posts).then(function(response) {
        assert.equal(200, response.status)
        fs.unlinkSync(path)
        done()

        VCR.ejectCassette(path)
      }).catch(err => { console.log(err); done() })
    })
  })

  describe('Multiple Requests', function() {
    this.timeout(15000)

    beforeEach(clearFixtures)
    afterEach(clearFixtures)

    var usersUrl = 'http://jsonplaceholder.typicode.com/users'
    var todosUrl = 'http://jsonplaceholder.typicode.com/todos'

    it('stores multiple requests in the same cassette', function(done) {
      var path = './test/fixtures/multiple.json'

      VCR.mountCassette(path)

      var usersPromise = axios.get(usersUrl)
      var todosPromise = axios.get(todosUrl)

      Promise.all([usersPromise, todosPromise]).then(function(responses) {
        var usersResponse = responses[0]
        var todosResponse = responses[1]

        var usersResponsePromise = getFixture(path, usersResponse.config)
        var todosResponsePromise = getFixture(path, todosResponse.config)

        return Promise.all([usersResponsePromise, todosResponsePromise]).then(function(fixtures) {
          assert.deepEqual(fixtures[0].originalResponseData.data, usersResponse.data)
          assert.deepEqual(fixtures[1].originalResponseData.data, todosResponse.data)
          done()

          VCR.ejectCassette(path)
        })
      }).catch(err => { console.log(err); done() })
    })
  })
})
