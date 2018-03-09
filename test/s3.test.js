const assert = require('assert');
const BlobService = require('../lib');
const aws = require('aws-sdk');
const FsBlobStore = require('s3-blob-store');

const { getBase64DataURI } = require('dauria');
const { bufferToHash } = require('../lib/util');
const _describe = process.env.S3_BUCKET ? describe : describe.skip;

_describe('feathers-blob-store-s3', () => {
  let s3, blobStore;

  before(() => {
    s3 = new aws.S3();
    blobStore = FsBlobStore({
      client: s3,
      bucket: process.env.S3_BUCKET
    });
  });

  it('basic functionality', () => {
    assert.equal(typeof BlobService, 'function', 'exports factory function');
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
      assert.deepEqual(res, {id: contentId});

      // test failing get
      return store.get(contentId)
        .catch(err => assert.ok(err, '.get() to non-existent id should error'));
    });
  });

  it('basic functionality with custom id', () => {
    assert.equal(typeof BlobService, 'function', 'exports factory function');
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
      assert.deepEqual(res, {id: contentId});

      // test failing get
      return store.get(contentId).catch(err =>
        assert.ok(err, '.get() to non-existent id should error')
      );
    });
  });
});
