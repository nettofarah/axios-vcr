const jsonDB = require('./jsonDb');
const digest = require('./digest');

const serialize = (response) => {
  const meta = {
    url: response.config.url,
    method: response.config.method,
    data: response.config.data,
    headers: response.config.headers,
  };

  return {
    meta,
    fixture: true,

    originalResponseData: {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      config: meta,
    },
  };
};

const storeFixture = (cassettePath, response) => {
  const requestKey = digest(response.config);
  const fixture = serialize(response);
  return jsonDB.writeAt(cassettePath, requestKey, fixture);
};

exports.success = cassettePath =>
  (res) => {
    if (res.fixture) {
      return res;
    }

    return storeFixture(cassettePath, res).then(() => res);
  };

exports.failure = error => Promise.reject(error);
