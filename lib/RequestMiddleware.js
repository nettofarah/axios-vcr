var fs = require('fs')

function load(path) {
  return new Promise(function(resolve, reject) {
    fs.readFile(path, function(err, data) {
      if (err)
        reject(err)
      else
        resolve(JSON.parse(data))
    })
  })
}

function checkFile(path) {
  return new Promise(function(resolve, reject) {
    fs.stat(path, function(err, stat) {
      if (err || !stat.isFile())
        reject(err)
      else
        resolve(path)
    })
  })
}

exports.success = function (cassettePath) {
  return function(axiosConfig) {
    return checkFile(cassettePath).then(function(filePath) {
      axiosConfig.adapter = function(resolve, reject, _cfg) {
        return load(filePath).then(resolve).catch(reject)
      }
      return axiosConfig
    }).catch(function(err) { return axiosConfig })
  }
}

exports.failure = function(error) {
  return Promise.reject(error)
}
