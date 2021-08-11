const fs = require('fs-extra')
const _ = require('lodash')
const mkdirp = require('mkdirp')
const getDirName = require('path').dirname

function loadAt(filePath, jsonPath) {
  return fs.readJson(filePath).then(function(json) {
    if (_.isUndefined(jsonPath))
      return json

    let value = _.get(json, jsonPath)
    if (!_.isUndefined(value))
      return value
    else
      throw "Invalid JSON Path"
  }).catch(err => console.log(err))
}

function writeAt(filePath, jsonPath, value) {
  mkdirp.sync(getDirName(filePath))

  return fs.readJson(filePath).then(function(json) {
    _.set(json, jsonPath, value)
    return fs.writeJson(filePath, json)
  }).catch(function(error) {
    let json = {}
    _.set(json, jsonPath, value)
    return fs.writeJson(filePath, json)
  })
}

module.exports = {
  loadAt: loadAt,
  writeAt: writeAt
}
