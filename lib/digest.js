var md5 = require('md5')

function key(axiosConfig) {
  var baseConfig = {
    url: axiosConfig.url,
    method: axiosConfig.method,
    data: axiosConfig.data,
    headers: axiosConfig.headers
  }

  return md5(JSON.stringify(baseConfig))
}

module.exports = key
