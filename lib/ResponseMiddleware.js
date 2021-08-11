const jsonDB = require('./jsonDb')
const digest = require('./digest')

function serialize(response) {
  let meta = {
    url: response.config.url,
    method: response.config.method,
    data: response.config.data,
    headers: response.config.headers
  }

  return {
    meta: meta,
    fixture: true,

    originalResponseData: {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      config: meta
    }
  }
}

function storeFixture(cassettePath, response) {
  let requestKey = digest(response.config)
  let fixture = serialize(response)

  return jsonDB.writeAt(cassettePath, requestKey, fixture)
}

exports.success = function (cassettePath) {
  return function(res) {
    if (res.fixture)
      return res

    return storeFixture(cassettePath, res).then(function() {
      return res
    })
  }
}

exports.failure = function(cassettePath) {
  return function(error) {
    if ( error && error.response && "404" == error.response.status ) {
      return storeFixture(cassettePath, error.response).then(function(){
        return Promise.reject(error)
      })
    }
    return Promise.reject(error)
  }
}
