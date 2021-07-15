const RequestMiddleware = require('./lib/RequestMiddleware');
const ResponseMiddleware = require('./lib/ResponseMiddleware');

const cassettes = {}

function mountCassette(cassettePath, client) {
  let axios = null;
  if ( client == null ) {
    axios = require('axios');
  } else {
    axios = client;
  }

  let responseInterceptor = axios.interceptors.response.use(
    ResponseMiddleware.success(cassettePath),
    ResponseMiddleware.failure
  );

  let requestInterceptor = axios.interceptors.request.use(
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
  let interceptors = cassettes[cassettePath];
  let axios = interceptors.axios;

  axios.interceptors.response.eject(interceptors.responseInterceptor);
  axios.interceptors.request.eject(interceptors.requestInterceptor);
}

module.exports = {
  mountCassette: mountCassette,
  ejectCassette: ejectCassette,
  RequestMiddleware: RequestMiddleware,
  ResponseMiddleware: ResponseMiddleware
}
