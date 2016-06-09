var md5 = require('md5')
var clone = require('lodash/clone')

function key(axiosConfig) {
  var baseConfig = {
    url: axiosConfig.url,
    method: axiosConfig.method,
    data: axiosConfig.data
  }

  var headers = clone(axiosConfig.headers)

  if (!headers['User-Agent'] && !headers['user-agent']) {
    headers['User-Agent'] = 'axios-vcr'
  }

  baseConfig.headers = headers

  return md5(JSON.stringify(baseConfig))
}

module.exports = key
