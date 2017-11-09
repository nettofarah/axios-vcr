const digest = require('../lib/digest');
const md5 = require('md5');
const assert = require('assert');
const _ = require('lodash');

function testDigest(cfg) {
  const config = _.pick(cfg, ['url', 'method', 'data', 'headers']);
  return md5(JSON.stringify(config));
}

describe('Digest', () => {
  it('md5s certain parameters from an axiosConfig object', () => {
    const sampleConfig = {
      url: 'http://cats.com',
      method: 'get',
      data: {},
      headers: {
        'user-agent': 'test',
      },
      extraProperty: 'bla',
      somethingElse: 'irrelevant',
    };

    const fullDigest = md5(JSON.stringify(sampleConfig));
    const expectedDigest = digest(sampleConfig);

    assert.notEqual(fullDigest, expectedDigest);
    assert.equal(testDigest(sampleConfig), expectedDigest);
  });
});
