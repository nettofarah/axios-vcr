const md5 = require('md5')
const _ = require('lodash')

function key(axiosConfig) {
  //Content-Length is calculated automatically by Axios before sending a request
  //We don't want to include it here because it could be changed by axios

  let url = axiosConfig.url
  let method = axiosConfig.method
  let data = axiosConfig.data
  let headers = axiosConfig.headers
  let params = axiosConfig.params

  if (_.isString(data)) {
    data = JSON.parse(data)
  }

  if (headers.common) {
    headers = _.assign(
      {},
      headers.common,
      headers[axiosConfig.method],
      _.omit(headers, [
        'common', 'delete', 'get', 'head', 'post', 'put', 'patch'
      ])
    )
  }
  headers = _.omit(headers, [
    'Content-Length', 'content-length'
  ])
  return md5(JSON.stringify({ url, method, data, headers, params }))
}

module.exports = key
