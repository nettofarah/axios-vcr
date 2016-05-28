// function load(path) {
//   return new Promise(function(resolve, reject) {
//     fs.readFile(path, function(err, data) {
//       if (err)
//         reject(err);
//       else
//         resolve(JSON.parse(data));
//     });
//   });
// }
//
// function checkFile(config) {
//   return new Promise(function(resolve, reject) {
//     var path = fileName(config);
//     fs.stat(path, function(err, stat) {
//       if (err || !stat.isFile())
//         reject(err);
//       else
//         resolve(path);
//     })
//   })
// }
//
// axios.interceptors.request.use(function(config) {
//   return checkFile(config).then(function(filePath) {
//     config.adapter = function(resolve, reject, _cfg) {
//       load(filePath).then(resolve).catch(reject)
//     }
//     return config
//   }).catch(function(err) {
//     return config;
//   })
// }, function(error) { return Promise.reject(error); });


exports.success = function (cassetePath) {
  return function(axiosConfig) {
    return axiosConfig;
  }
};

exports.failure = function(axiosConfig) {
  return axiosConfig;
};
