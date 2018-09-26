var digest = require('./digest')
var jsonDB = require('./jsonDb')

function loadFixture(cassettePath, axiosConfig) {
  var requestKey = digest(axiosConfig)
  return jsonDB.loadAt(cassettePath, requestKey)
}

function injectVCRHeader(axiosConfig) {
  // This is done like this because Axios injects a custom User-Agent in
  // the request config if it hasn't been defined by the client.
  //
  // We need to do the same thing and inject our own so Axios doesn't modify
  // the request config object at a later point (which breaks our logic because
  // digests will be different at request and response times)

  var headers = axiosConfig.headers
  if (!headers['User-Agent'] && !headers['user-agent']) {
    headers['User-Agent'] = 'axios-vcr'
  }
}

exports.success = function (cassettePath) {
  return function(axiosConfig) {
    injectVCRHeader(axiosConfig)

    return loadFixture(cassettePath, axiosConfig).then(function(cassette) {
      axiosConfig.adapter = function(_config) {
        cassette.originalResponseData.fixture = true
        return Promise.resolve(cassette.originalResponseData)
      }
      return axiosConfig
    }).catch(function(err) {
      return axiosConfig
    })
  }
}

exports.failure = function(error) {
  return Promise.reject(error)
}
