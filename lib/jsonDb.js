
const _ = require('lodash');
const mkdirp = require('mkdirp');
const getDirName = require('path').dirname;

const { readJson, writeJson } = require('./readWriteJson');

const loadAt = (filePath, jsonPath) =>
  readJson(filePath).then((json) => {
    if (_.isUndefined(jsonPath)) {
      return json;
    }

    const value = _.get(json, jsonPath);
    if (!_.isUndefined(value)) {
      return value;
    }

    throw new Error('Invalid JSON Path');
  });

const writeAt = (filePath, jsonPath, value) => {
  mkdirp.sync(getDirName(filePath));

  return readJson(filePath).then((json) => {
    _.set(json, jsonPath, value);
    return writeJson(filePath, json);
  }).catch(() => {
    const json = {};
    _.set(json, jsonPath, value);
    return writeJson(filePath, json);
  });
};

module.exports = {
  loadAt,
  writeAt,
};
