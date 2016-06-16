import assert from 'assert';
import { join } from 'path';
import BlobService from '../src';
import FsBlobStore from 'fs-blob-store';
import { getBase64DataURI } from 'dauria';
import waterfall from 'run-waterfall';

import { bufferToHash } from '../src/util';

describe('feathers-blob-store', () => {
  it('is CommonJS compatible', () => {
    assert.equal(typeof require('../lib'), 'function');
  });

  it('basic functionality', done => {
    assert.equal(typeof BlobService, 'function', 'exports factory function');

    const blobStore = FsBlobStore(join(__dirname, 'blobs'));
    const store = BlobService({
      Model: blobStore
    });

    const content = new Buffer('hello world!');
    const contentHash = bufferToHash(content);
    const contentType = 'text/plain';
    const contentUri = getBase64DataURI(content, contentType);
    const contentExt = 'txt';
    const contentId = `${contentHash}.${contentExt}`;

    waterfall([
      function (cb) {
        // test successful create
        store.create({ uri: contentUri }, {}, cb);
      },
      function (res, cb) {
        assert.equal(res.id, contentId);
        assert.equal(res.uri, contentUri);
        assert.equal(res.size, content.length);

        // test successful get
        store.get(contentId, {}, cb);
      },
      function (res, cb) {
        assert.equal(res.id, contentId);
        assert.equal(res.uri, contentUri);
        assert.equal(res.size, content.length);

        // test successful remove
        store.remove(contentId, {}, cb);
      },
      function (res, cb) {
        assert.equal(res, null);

        // test failing get
        store.get(contentId, {}, function (err) {
          assert.ok(err, '.get() to non-existent id should error');

          cb();
        });
      }
    ], done);
  });

  it('basic functionality with custom id', done => {
    assert.equal(typeof BlobService, 'function', 'exports factory function');

    const blobStore = FsBlobStore(join(__dirname, 'blobs'));
    const store = BlobService({
      Model: blobStore
    });

    const content = new Buffer('hello world!');
    const contentHash = bufferToHash(content);
    const contentType = 'text/plain';
    const contentUri = getBase64DataURI(content, contentType);
    const contentExt = 'txt';
    const contentId = `custom/id/${contentHash}.${contentExt}`;

    waterfall([
      function (cb) {
        // test successful create
        store.create({ id: contentId, uri: contentUri }, {}, cb);
      },
      function (res, cb) {
        assert.equal(res.id, contentId);
        assert.equal(res.uri, contentUri);
        assert.equal(res.size, content.length);

        // test successful get
        store.get(contentId, {}, cb);
      },
      function (res, cb) {
        assert.equal(res.id, contentId);
        assert.equal(res.uri, contentUri);
        assert.equal(res.size, content.length);

        // test successful remove
        store.remove(contentId, {}, cb);
      },
      function (res, cb) {
        assert.equal(res, null);

        // test failing get
        store.get(contentId, {}, function (err) {
          assert.ok(err, '.get() to non-existent id should error');

          cb();
        });
      }
    ], done);
  });
});
