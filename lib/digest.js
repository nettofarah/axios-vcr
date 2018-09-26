var md5 = require('md5')
var _ = require('lodash')

var utils = require('axios/lib/utils')
var transformData = require('axios/lib/core/transformData')
var isCancel = require('axios/lib/cancel/isCancel')
var defaults = require('axios/lib/defaults')
var isAbsoluteURL = require('axios/lib/helpers/isAbsoluteURL')
var combineURLs = require('axios/lib/helpers/combineURLs')

function key (axiosConfig) {
  const config = _.cloneDeep(axiosConfig)

  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url)
  }

  config.headers = config.headers || {}

  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  )

  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  )

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig (method) {
      delete config.headers[method]
    }
  )

  var baseConfig = {
    url: config.url,
    method: config.method,
    data: config.data,
    //Content-Length is calculated automatically by Axios before sending a request
    //We don't want to include it here because it could be changed by axios
    headers: _.omit(config.headers, ['Content-Length', 'content-length']),
  }

  return md5(JSON.stringify(baseConfig))
}

module.exports = key
