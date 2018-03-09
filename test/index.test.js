const assert = require('assert');
const { join } = require('path');

const BlobService = require('../lib');
const FsBlobStore = require('fs-blob-store');

const { getBase64DataURI } = require('dauria');
const { bufferToHash } = require('../lib/util');

describe('feathers-blob-store', () => {
  const content = Buffer.from('hello world!');
  const contentHash = bufferToHash(content);
  const contentType = 'text/plain';
  const contentUri = getBase64DataURI(content, contentType);
  const contentExt = 'txt';

  it('is CommonJS compatible', () => {
    assert.equal(typeof require('../lib'), 'function');
  });

  it('basic functionality with data URI', () => {
    assert.equal(typeof BlobService, 'function', 'exports factory function');

    const blobStore = FsBlobStore(join(__dirname, 'blobs'));
    const store = BlobService({
      Model: blobStore
    });

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
      assert.deepEqual(res, {id: contentId});

      // test failing get
      return store.get(contentId)
        .catch(err => assert.ok(err, '.get() to non-existent id should error'));
    });
  });

  it('basic functionality with buffer', () => {
    assert.equal(typeof BlobService, 'function', 'exports factory function');

    const blobStore = FsBlobStore(join(__dirname, 'blobs'));
    const store = BlobService({
      Model: blobStore
    });

    const contentId = `${contentHash}.${contentExt}`;

    return store.create({ buffer: content, contentType }).then(res => {
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
      assert.deepEqual(res, {id: contentId});

      // test failing get
      return store.get(contentId)
        .catch(err => assert.ok(err, '.get() to non-existent id should error'));
    });
  });

  it('basic functionality with custom object id', () => {
    assert.equal(typeof BlobService, 'function', 'exports factory function');

    const blobStore = FsBlobStore(join(__dirname, 'blobs'));
    const store = BlobService({
      Model: blobStore
    });

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
      assert.deepEqual(res, {id: contentId});

      // test failing get
      return store.get(contentId).catch(err =>
        assert.ok(err, '.get() to non-existent id should error')
      );
    });
  });

  it('basic functionality with custom output id field', () => {
    assert.equal(typeof BlobService, 'function', 'exports factory function');

    const blobStore = FsBlobStore(join(__dirname, 'blobs'));
    const store = BlobService({
      Model: blobStore,
      id: '_id'
    });

    const contentId = `${contentHash}.${contentExt}`;

    return store.create({ id: contentId, uri: contentUri }).then(res => {
      assert.equal(res._id, contentId);
      assert.equal(res.uri, contentUri);
      assert.equal(res.size, content.length);

      // test successful get
      return store.get(contentId);
    }).then(res => {
      assert.equal(res._id, contentId);
      assert.equal(res.uri, contentUri);
      assert.equal(res.size, content.length);

      // test successful remove
      return store.remove(contentId);
    }).then(res => {
      assert.deepEqual(res, {_id: contentId});

      // test failing get
      return store.get(contentId).catch(err =>
        assert.ok(err, '.get() to non-existent id should error')
      );
    });
  });
});
