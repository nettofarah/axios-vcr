const digest = require('./digest')
const jsonDB = require('./jsonDb')
const createError = require('axios/lib/core/createError');

function loadFixture(cassettePath, axiosConfig) {
  let requestKey = digest(axiosConfig)
  return jsonDB.loadAt(cassettePath, requestKey)
}

function injectVCRHeader(axiosConfig) {
  // This is done like this because Axios injects a custom User-Agent in
  // the request config if it hasn't been defined by the client.
  //
  // We need to do the same thing and inject our own so Axios doesn't modify
  // the request config object at a later point (which breaks our logic because
  // digests will be different at request and response times)

  let headers = axiosConfig.headers
  if (!headers['User-Agent'] && !headers['user-agent']) {
    headers['User-Agent'] = 'axios-vcr'
  }
}

exports.success = function (cassettePath) {
  return function(axiosConfig) {
    injectVCRHeader(axiosConfig)

    return loadFixture(cassettePath, axiosConfig).then(function(cassette) {
      axiosConfig.adapter = function() {
        return new Promise(function(resolve, reject) {
          cassette.originalResponseData.fixture = true
          if ( cassette.originalResponseData && 404 == cassette.originalResponseData.status ) {
            return reject(createError(
              'Request failed with status code ' + cassette.originalResponseData.status,
              cassette.originalResponseData.config,
              null,
              cassette.originalResponseData.request,
              cassette.originalResponseData
            ))
          } else {
            return resolve(cassette.originalResponseData)
          }
        });
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
