# axios-vcr
:vhs: Record and Replay requests in JavaScript

axios-vcr is a set of [axios](https://github.com/mzabriskie/axios) middlewares that allow you to record and replay axios requests.
Use it for reliable, fast and more deterministic tests.

[![Build Status](https://travis-ci.org/nettofarah/axios-vcr.svg?branch=master)](https://travis-ci.org/nettofarah/axios-vcr)

## Features
- [x] Record http requests to JSON cassette files
- [x] Replay requests from cassete files
- [x] Multiple request/response fixtures per cassette
- [ ] Cassette expiration logic
- [ ] Mocha integration
- [ ] non-global axios instances support

## Installation
```bash
$ npm install --save-dev axios-vcr
```

## Usage
Using axios-vcr is very simple. All you need to do is to provide a cassette path and wrap your axios code with `axiosVCR.mountCassette` and `axiosVCR.ejectCassette`.

```javascript
const axiosVCR = require('axios-vcr');

axiosVCR.mountCassette('./test/fixtures/cats.json')

axios.get('https://reddit.com/r/cats.json').then(response => {
  // axios-vcr will store the remote response from /cats.json
  // in ./test/fixtures/cats.json
  // Subsequent requests will then load the response directly from the file system

  axiosVCR.ejectCassette('https://reddit.com/r/cats.json')
})
```

### Usage in a test case
```javascript
it('makes your requests load faster and more reliably', function(done) {
  // mount a cassette
  axiosVCR.mountCassette('./fixtures/test_case_name.json')

  myAPI.fetchSomethingFromRemote().then(function(response) {
    assert.equal(response.something, 'some value')
    done()

    // Eject the cassette when all your promises have been fulfilled
    axiosVCR.ejectCassette('./fixture/test_case_name.json')
  })
})
```

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/nettofarah/axios-vcr. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Code of Conduct](https://github.com/nettofarah/axios-vcr/blob/master/CODE_OF_CONDUCT.md).

To run the specs check out the repo and follow these steps:

```bash
$ npm install
$ npm test
```

## License

The module is available as open source under the terms of the MIT License.
