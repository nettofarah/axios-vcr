var md5 = require('md5')
var _ = require('lodash')

function key(axiosConfig) {
  //Content-Length is calculated automatically by Axios before sending a request
  //We don't want to include it here because it could be changed by axios


  var baseConfig = {
    url: axiosConfig.url,
    method: axiosConfig.method,
    data: axiosConfig.data,
    headers: _.omit(axiosConfig.headers, [
      'Content-Length', 'content-length'
    ])
  }

  return md5(JSON.stringify(baseConfig))
}

module.exports = key
