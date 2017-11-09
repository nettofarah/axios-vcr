const md5 = require('md5');
const _ = require('lodash');

const key = (args) => {
  const {
    baseURL, method, data, transformRequest,
  } = args;
  let { url, headers = {} } = args;
  // Flatten headers
  // Same happening in dispatchResponse.js

  // Support baseURL config
  if (baseURL && !/^([a-z][a-z\d+\-.]*:)?\/\//i.test(url)) {
    url = url
      ? `${baseURL.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`
      : baseURL;
  }

  headers = _.merge(
    headers.common || {},
    headers[method] || {},
    headers || {},
  );

  headers = _.omit(
    headers,
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common',
      // Content-Length is calculated automatically by Axios before sending a request
      // We don't want to include it here because it could be changed by axios
      'Content-Length', 'content-length',
    ],
  );

  const baseConfig = {
    url,
    method,
    data: _.values(transformRequest).reduce((nextData, fn) => fn(nextData, headers), data),
    headers,
  };

  return md5(JSON.stringify(baseConfig));
};

module.exports = key;
