var fs = require('fs-promise')
var _ = require('lodash')
var mkdirp = require('mkdirp')
var getDirName = require('path').dirname

var writing = false

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function write(filePath, jsonPath, value) {
  return fs
    .readJson(filePath)
    .then(function(json) {
      _.set(json, jsonPath, value)
      return fs.writeJson(filePath, json)
    })
    .catch(function(error) {
      var json = {}
      _.set(json, jsonPath, value)
      return fs.writeJson(filePath, json)
    })
    .then(function() {
      writing = false
    })
    .catch(function() {
      writing = false
    })
}

function loadAt(filePath, jsonPath) {
  return fs.readJson(filePath).then(function(json) {
    if (_.isUndefined(jsonPath))
      return json

    var value = _.get(json, jsonPath)
    if (!_.isUndefined(value))
      return value
    else
      throw "Invalid JSON Path"
  })
}

function writeAt(filePath, jsonPath, value) {
  if (!writing) {
    writing = true
    mkdirp.sync(getDirName(filePath))
    return write(filePath, jsonPath, value)
  } else {
    return sleep(2000).then(() => writeAt(filePath, jsonPath, value))
  }
}

module.exports = {
  loadAt: loadAt,
  writeAt: writeAt
}
