var RequestMiddleware = require('./lib/RequestMiddleware');
var ResponseMiddleware = require('./lib/ResponseMiddleware');

function useCassette(cassettePath, cb) {
  var axios = require('axios');

  var responseInterceptor = axios.interceptors.response.use(
    ResponseMiddleware.success(cassettePath),
    ResponseMiddleware.failure
  );

  var requestInterceptor = axios.interceptors.request.use(
    RequestMiddleware.success(cassettePath),
    RequestMiddleware.failure
  )

  cb();

  axios.interceptors.response.eject(responseInterceptor);
  axios.interceptors.request.eject(requestInterceptor);
}

module.exports = {
  useCassette: useCassette,
  RequestMiddleware: RequestMiddleware,
  ResponseMiddleware: ResponseMiddleware
}
