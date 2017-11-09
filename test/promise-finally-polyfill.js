/* eslint-disable no-extend-native */

if (typeof Promise !== 'function') {
  throw new TypeError('A global Promise is required');
}

if (typeof Promise.prototype.finally !== 'function') {
  const speciesConstructor = (O, defaultConstructor) => {
    if (!O || (typeof O !== 'object' && typeof O !== 'function')) {
      throw new TypeError('Assertion failed: Type(O) is not Object');
    }
    const C = O.constructor;
    if (typeof C === 'undefined') {
      return defaultConstructor;
    }
    if (!C || (typeof C !== 'object' && typeof C !== 'function')) {
      throw new TypeError('O.constructor is not an Object');
    }
    const S = typeof Symbol === 'function' && typeof Symbol.species === 'symbol' ? C[Symbol.species] : undefined;
    if (S === null) {
      return defaultConstructor;
    }
    if (typeof S === 'function' && S.prototype) {
      return S;
    }
    throw new TypeError('no constructor found');
  };

  const shim = {
    finally(onFinally) {
      const promise = this;
      if (typeof promise !== 'object' || promise === null) {
        throw new TypeError('"this" value is not an Object');
      }
      const C = speciesConstructor(promise, Promise); // throws if SpeciesConstructor throws
      const handler = typeof onFinally === 'function' ? onFinally : () => {};
      return Promise.prototype.then.call(
        promise,
        x => new C(resolve => resolve(handler())).then(() => x),
        e => new C(resolve => resolve(handler())).then(() => {
          throw e;
        }),
      );
    },
  };
  Object.defineProperty(Promise.prototype, 'finally', { configurable: true, writable: true, value: shim.finally });
}
