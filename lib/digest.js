var md5 = require('md5')
var _ = require('lodash')

function key({url, headers = {}, method, data, transformRequest}) {
  // Flatten headers
  // Same happening in dispatchResponse.js

  headers = _.merge(
    headers.common || {},
    headers[method] || {},
    headers || {}
  );

  headers = _.omit(
    headers,
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common',
      //Content-Length is calculated automatically by Axios before sending a request
      //We don't want to include it here because it could be changed by axios
      'Content-Length', 'content-length'
    ]
  );

  const baseConfig = {
    url,
    method: method,
    data: _.values(transformRequest).reduce((data, fn) => fn(data, headers), data),
    headers
  };

  return md5(JSON.stringify(baseConfig))
}

module.exports = key
