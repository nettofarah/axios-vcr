var jsonDB = require('../lib/jsonDb')
var assert = require('assert')
var fs = require('fs-promise')
var rimraf = require('rimraf')

function clearFixtures() {
  rimraf.sync('./test/jdb/*')
}

describe('JsonDB', function() {
  afterEach(clearFixtures)

  describe('loadAt', function() {
    var path = './test/jdb/temp.json'

    beforeEach(function() {
      fs.writeJsonSync(path, {
        a: {
          b: {
            c: 'it works!'
          }
        }
      })
    })

    it('loads an object from a JSON stored in a file', function(done) {
      jsonDB.loadAt(path).then(function(payload) {
        assert.deepEqual(payload, {
          a: {
            b: {
              c: 'it works!'
            }
          }
        })
        done()
      })
    })

    it('accepts nested paths', function(done) {
      jsonDB.loadAt(path, 'a.b.c').then(function(payload) {
        assert.equal(payload, 'it works!')
        done()
      })
    })

    it('fails when the file does not exist', function(done) {
      jsonDB.loadAt('./test/jdb/unexisting.json').catch(function(error) {
        assert.equal(error.code, 'ENOENT')
        done()
      })
    })

    it('fails when the json path does not exist', function(done) {
      jsonDB.loadAt('./test/jdb/temp.json', 'a.b.c.d').catch(function(error) {
        assert.equal(error, 'Invalid JSON Path')
        done()
      })
    })
  })

  describe('writeAt', function() {
    var path = './test/jdb/temp_write.json'

    beforeEach(function() {
      fs.writeJsonSync(path, {
        a: {
          b: {}
        }
      })
    })

    it('writes at a given path', function(done) {
      var time = new Date().getTime()
      var payload = { c: 'Axios VCR', time: time }

      jsonDB.writeAt(path, 'a.b', payload).then(function() {
        jsonDB.loadAt(path, 'a.b').then(function(json) {
          assert.deepEqual(payload, json)
          done()
        })
      })
    })

    it('creates missing keys', function(done) {
      var payload = 'nested stuff'
      jsonDB.writeAt(path, 'a.b.c.d.e', payload).then(function() {
        jsonDB.loadAt(path, 'a.b.c.d.e').then(function(json) {
          assert.deepEqual(payload, json)
          done()
        })
      })
    })

    it('creates missing parts of the path', function(done) {
      var path = './test/jdb/nested/temp_write.json'
      var payload = 'something'

      jsonDB.writeAt(path, 'a', payload).then(function() {
        jsonDB.loadAt(path, 'a').then(function(json) {
          assert.deepEqual(payload, json)
          done()
        })
      })
    })
  })
})
