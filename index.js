var axios = require('axios');
var fs = require('fs');
var mkdirp = require('mkdirp');
var md5 = require('md5');
var url = require('url');
var cloneDeep = require('lodash').cloneDeep;

var folder = './cassetes'
mkdirp.sync(folder, { mode: 0o777 });

function serialize(response) {
  return {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers, data: response.data,
    config: response.config
  }
}

function fileName(config) {
  var cfg = cloneDeep(config);

  if (!cfg.headers['User-Agent'] && !cfg.headers['user-agent']) {
    cfg.headers['User-Agent'] = 'axios/0.11.1';
  }

  var hostname = url.parse(cfg.url).hostname.replace(/\./g, '_');
  var data = JSON.stringify(cfg);
  return folder + "/" + hostname + "_" + md5(data) + ".json";
}

function store(path, response) {
  var json = JSON.stringify(response);
  return new Promise(function(resolve, reject) {
    fs.writeFile(path, json, { mode: 0o777 }, function(err) {
      if (err)
        reject(err);
      else
        resolve();
    });
  })
}

function load(path) {
  return new Promise(function(resolve, reject) {
    fs.readFile(path, function(err, data) {
      if (err)
        reject(err);
      else
        resolve(JSON.parse(data));
    });
  });
}

function checkFile(config) {
  return new Promise(function(resolve, reject) {
    var path = fileName(config);
    fs.stat(path, function(err, stat) {
      if (err || !stat.isFile())
        reject(err);
      else
        resolve(path);
    })
  })
}

axios.interceptors.request.use(function(config) {
  return checkFile(config).then(function(filePath) {
    config.adapter = function(resolve, reject, _cfg) {
      load(filePath).then(resolve).catch(reject)
    }
    return config
  }).catch(function(err) {
    return config;
  })
}, function(error) { return Promise.reject(error); });

axios.interceptors.response.use(function(response) {
  var serialized = serialize(response)
  return store(fileName(response.config), serialized).then(function() {
    return response;
  })
}, function(error) {
  return Promise.reject(error);
});

axios.get('https://reddit.com/r/cats.json').then(function(res) {
  console.log('hello');
  console.log(res);
}).catch(function(err) {
  console.log('buh', err);
});
