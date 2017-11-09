const util = require('util');
const fs = require('fs');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readJson = filePath => readFile(filePath, 'utf8').then(data => JSON.parse(data));
const writeJson = (filePath, json) => writeFile(filePath, JSON.stringify(json));

module.exports = { readJson, writeJson };
