import assert from 'assert';
import plugin from '../src';

describe('feathers-blob-store', () => {
  it('is CommonJS compatible', () => {
    assert.equal(typeof require('../lib'), 'function');
  });

  it('basic functionality', done => {
    assert.equal(typeof plugin, 'function', 'It worked');
    done();
  });
});
