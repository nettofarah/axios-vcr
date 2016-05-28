var mkdirp = require('mkdirp');
var fs = require('fs');
var getDirName = require('path').dirname;

function serialize(response) {
  return {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    data: response.data
  }
}

function store(path, payload) {
  mkdirp.sync(getDirName(path));
  var json = JSON.stringify(payload, null, '\t');

  return new Promise(function(resolve, reject) {
    fs.writeFile(path, json, { mode: 0o777 }, function(err) {
      if (err)
        reject(err);
      else
        resolve();
    });
  })
}

exports.success = function (cassettePath) {
  return function(response) {
    var serialized = serialize(response)

    return store(cassettePath, serialized).then(function() {
      return response;
    })
  }
};

exports.failure = function(error) {
  return Promise.reject(error);
};
