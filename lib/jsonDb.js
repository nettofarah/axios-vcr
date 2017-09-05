var fs = require('fs-extra')
var _ = require('lodash')
var mkdirp = require('mkdirp')
var getDirName = require('path').dirname

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
  mkdirp.sync(getDirName(filePath))

  return fs.readJson(filePath).then(function(json) {
    _.set(json, jsonPath, value)
    return fs.writeJson(filePath, json)
  }).catch(function(error) {
    var json = {}
    _.set(json, jsonPath, value)
    return fs.writeJson(filePath, json)
  })
}

module.exports = {
  loadAt: loadAt,
  writeAt: writeAt
}
