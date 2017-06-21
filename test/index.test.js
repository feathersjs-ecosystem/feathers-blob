import assert from 'assert';
import { join } from 'path';
import BlobService from '../src';
import FsBlobStore from 'fs-blob-store';
import { getBase64DataURI } from 'dauria';

import { bufferToHash } from '../src/util';

describe('feathers-blob-store', () => {
  it('is CommonJS compatible', () => {
    assert.equal(typeof require('../lib'), 'function');
  });

  it('basic functionality', () => {
    assert.equal(typeof BlobService, 'function', 'exports factory function');

    const blobStore = FsBlobStore(join(__dirname, 'blobs'));
    const store = BlobService({
      Model: blobStore
    });

    const content = Buffer.from('hello world!');
    const contentHash = bufferToHash(content);
    const contentType = 'text/plain';
    const contentUri = getBase64DataURI(content, contentType);
    const contentExt = 'txt';
    const contentId = `${contentHash}.${contentExt}`;

    return store.create({ uri: contentUri }).then(res => {
      assert.equal(res.id, contentId);
      assert.equal(res.uri, contentUri);
      assert.equal(res.size, content.length);

      // test successful get
      return store.get(contentId);
    }).then(res => {
      assert.equal(res.id, contentId);
      assert.equal(res.uri, contentUri);
      assert.equal(res.size, content.length);

      // test successful remove
      return store.remove(contentId);
    }).then(res => {
      assert.equal(res, null);

      // test failing get
      return store.get(contentId)
        .catch(err => assert.ok(err, '.get() to non-existent id should error'));
    });
  });

  it('basic functionality with custom id', () => {
    assert.equal(typeof BlobService, 'function', 'exports factory function');

    const blobStore = FsBlobStore(join(__dirname, 'blobs'));
    const store = BlobService({
      Model: blobStore
    });

    const content = Buffer.from('hello world!');
    const contentHash = bufferToHash(content);
    const contentType = 'text/plain';
    const contentUri = getBase64DataURI(content, contentType);
    const contentExt = 'txt';
    const contentId = `custom/id/${contentHash}.${contentExt}`;

    return store.create({ id: contentId, uri: contentUri }).then(res => {
      assert.equal(res.id, contentId);
      assert.equal(res.uri, contentUri);
      assert.equal(res.size, content.length);

      // test successful get
      return store.get(contentId);
    }).then(res => {
      assert.equal(res.id, contentId);
      assert.equal(res.uri, contentUri);
      assert.equal(res.size, content.length);

      // test successful remove
      return store.remove(contentId);
    }).then(res => {
      assert.equal(res, null);

      // test failing get
      return store.get(contentId).catch(err =>
        assert.ok(err, '.get() to non-existent id should error')
      );
    });
  });
});
