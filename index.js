var RequestMiddleware = require('./lib/RequestMiddleware');
var ResponseMiddleware = require('./lib/ResponseMiddleware');

function useCassete(cassetePath, cb) {
  var axios = require('axios');

  var interceptor = axios.interceptors.response.use(
    ResponseMiddleware.success(cassetePath),
    ResponseMiddleware.failure
  );

  cb();

  axios.interceptors.response.eject(interceptor);
}

module.exports = {
  useCassete: useCassete,
  RequestMiddleware: RequestMiddleware,
  ResponseMiddleware: ResponseMiddleware
}
