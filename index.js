var RequestMiddleware = require('./lib/RequestMiddleware');
var ResponseMiddleware = require('./lib/ResponseMiddleware');

var cassettes = {}

function mountCassette(cassettePath, options = {}) {
  var defaults = {
    instance: require('axios')
  }
  options = Object.assign(defaults, options);
  var axios = options.instance;

  var responseInterceptor = axios.interceptors.response.use(
    ResponseMiddleware.success(cassettePath),
    ResponseMiddleware.failure
  );

  var requestInterceptor = axios.interceptors.request.use(
    RequestMiddleware.success(cassettePath),
    RequestMiddleware.failure
  );

  cassettes[cassettePath] = {
    responseInterceptor: responseInterceptor,
    requestInterceptor: requestInterceptor,
    axios: axios
  };
}

function ejectCassette(cassettePath) {
  var interceptors = cassettes[cassettePath];
  var axios = interceptors.axios;

  axios.interceptors.response.eject(interceptors.responseInterceptor);
  axios.interceptors.request.eject(interceptors.requestInterceptor);
}

module.exports = {
  mountCassette: mountCassette,
  ejectCassette: ejectCassette,
  RequestMiddleware: RequestMiddleware,
  ResponseMiddleware: ResponseMiddleware
}
