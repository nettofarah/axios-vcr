/* eslint-disable no-param-reassign */
const digest = require('./digest');
const jsonDB = require('./jsonDb');

const loadFixture = (cassettePath, axiosConfig) => {
  const requestKey = digest(axiosConfig);
  return jsonDB.loadAt(cassettePath, requestKey);
};

exports.success = cassettePath =>
  axiosConfig =>
    loadFixture(cassettePath, axiosConfig)
      .then((cassette) => {
        axiosConfig.adapter = () =>
          new Promise((resolve) => {
            cassette.originalResponseData.fixture = true;
            return resolve(cassette.originalResponseData);
          });
        return axiosConfig;
      }).catch(() => axiosConfig);

exports.failure = error => Promise.reject(error);
