var RequestMiddleware = require('./lib/RequestMiddleware');
var ResponseMiddleware = require('./lib/ResponseMiddleware');

function useCassete(cassetePath, cb) {
  var axios = require('axios');

  var responseInterceptor = axios.interceptors.response.use(
    ResponseMiddleware.success(cassetePath),
    ResponseMiddleware.failure
  );

  var requestInterceptor = axios.interceptors.request.use(
    RequestMiddleware.success(cassetePath),
    RequestMiddleware.failure
  )

  cb();

  axios.interceptors.response.eject(responseInterceptor);
  axios.interceptors.request.eject(requestInterceptor);
}

module.exports = {
  useCassete: useCassete,
  RequestMiddleware: RequestMiddleware,
  ResponseMiddleware: ResponseMiddleware
}
