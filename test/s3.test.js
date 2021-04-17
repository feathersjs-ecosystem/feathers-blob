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

  it('service operations on S3 storage', async () => {
    const store = BlobService({
      Model: blobStore
    });

    const content = Buffer.from('hello world!');
    const contentHash = bufferToHash(content);
    const contentType = 'text/plain';
    const contentUri = getBase64DataURI(content, contentType);
    const contentExt = 'txt';
    const contentId = `${contentHash}.${contentExt}`;

    let res = await store.create({ uri: contentUri });
    assert.strictEqual(res.id, contentId);
    assert.strictEqual(res.uri, contentUri);
    assert.strictEqual(res.size, content.length);
    assert.strictEqual(res.contentType, contentType);

    // test successful get
    res = await store.get(contentId);
    assert.strictEqual(res.id, contentId);
    assert.strictEqual(res.uri, contentUri);
    assert.strictEqual(res.size, content.length);
    assert.strictEqual(res.contentType, contentType);

    // test successful remove
    res = await store.remove(contentId);
    assert.deepStrictEqual(res, { id: contentId });

    try {
      // test failing get
      await store.get(contentId);
    } catch (err) {
      assert.ok(err, '.get() to non-existent id should error');
    }
  });

  it('service operations on S3 storage with custom id', async () => {
    const store = BlobService({
      Model: blobStore
    });

    const content = Buffer.from('hello world!');
    const contentHash = bufferToHash(content);
    const contentType = 'text/plain';
    const contentUri = getBase64DataURI(content, contentType);
    const contentExt = 'txt';
    const contentId = `custom/id/${contentHash}.${contentExt}`;

    let res = await store.create({ id: contentId, uri: contentUri });
    assert.strictEqual(res.id, contentId);
    assert.strictEqual(res.uri, contentUri);
    assert.strictEqual(res.size, content.length);
    assert.strictEqual(res.contentType, contentType);

    // test successful get
    res = await store.get(contentId);
    assert.strictEqual(res.id, contentId);
    assert.strictEqual(res.uri, contentUri);
    assert.strictEqual(res.size, content.length);
    assert.strictEqual(res.contentType, contentType);

    // test successful remove
    res = await store.remove(contentId);
    assert.deepStrictEqual(res, { id: contentId });

    try {
      // test failing get
      await store.get(contentId);
    } catch (err) {
      assert.ok(err, '.get() to non-existent id should error');
    }
  });

  it('service operations on S3 storage with a large binary file from a buffer', async () => {
    const store = BlobService({
      Model: blobStore
    });

    const content = Buffer.alloc(0.01 * 1024 * 1024); // 20Mb
    const contentHash = bufferToHash(content);
    const contentType = 'application/octet-stream';
    const contentUri = getBase64DataURI(content, contentType);
    const contentExt = 'bin';
    const contentId = `${contentHash}.${contentExt}`;

    let res = await store.create({ buffer: content, contentType });
    assert.strictEqual(res.id, contentId);
    assert.strictEqual(res.uri, contentUri);
    assert.strictEqual(res.size, content.length);
    assert.strictEqual(res.contentType, contentType);

    // test successful get
    res = await store.get(contentId);
    assert.strictEqual(res.id, contentId);
    assert.strictEqual(res.uri, contentUri);
    assert.strictEqual(res.size, content.length);
    assert.strictEqual(res.contentType, contentType);

    // test successful remove
    res = await store.remove(contentId);
    assert.deepStrictEqual(res, { id: contentId });

    try {
      // test failing get
      await store.get(contentId);
    } catch (err) {
      assert.ok(err, '.get() to non-existent id should error');
    }
  }).timeout(300000);
});
