var digest = require('./digest')
var jsonDB = require('./jsonDb')

function loadFixture(cassettePath, axiosConfig) {
  var requestKey = digest(axiosConfig)
  return jsonDB.loadAt(cassettePath, requestKey)
}

exports.success = function (cassettePath) {
  return function(axiosConfig) {
    return loadFixture(cassettePath, axiosConfig).then(function(cassette) {
      axiosConfig.adapter = function(_cfg) {
        cassette.originalResponseData.fixture = true
        return Promise.resolve(cassette.originalResponseData);
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
