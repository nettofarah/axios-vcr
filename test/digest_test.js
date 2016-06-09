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
})
