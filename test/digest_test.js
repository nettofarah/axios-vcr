var digest = require('../lib/digest')
var md5 = require('md5')
var assert = require('assert')
var _ = require('lodash')

function testDigest(cfg) {
  var config = _.pick(cfg, ['url', 'method', 'data', 'headers'])
  return md5(JSON.stringify(config))
}

describe('Digest', function() {

  it('md5s certain parameters from an axiosConfig object', function() {
    var sampleConfig = {
      url: 'http://cats.com',
      method: 'get',
      data: {},
      headers: {
        'user-agent': 'test'
      },
      extraProperty: 'bla',
      somethingElse: 'irrelevant'
    }

    var fullDigest = md5(JSON.stringify(sampleConfig))
    var expectedDigest = digest(sampleConfig)

    assert.notEqual(fullDigest, expectedDigest)
    assert.equal(testDigest(sampleConfig), expectedDigest)
  })

  it('includes a custom User-Agent when not provided', function() {
    // This is done like this because Axios injects a custom User-Agent in
    // the request config if it hasn't been defined by the client.
    //
    // We need to do the same thing and inject our own so Axios doesn't modify
    // the request config object at a later point (which breaks our logic because
    // digests will be different at request and response times)

    var sampleConfig = {
      url: 'bla',
      method: 'get',
      data: {},
      headers: {}
    }

    assert.notEqual(digest(sampleConfig), testDigest(sampleConfig))

    sampleConfig.headers['User-Agent'] = 'axios-vcr'
    assert.equal(digest(sampleConfig), testDigest(sampleConfig))
  })
})
