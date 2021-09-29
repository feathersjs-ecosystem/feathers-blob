const assert = require('assert');
const { join } = require('path');
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const rest = require('@feathersjs/express/rest');
const client = require('@feathersjs/client');
const request = require('superagent');
const bodyParser = require('body-parser');
const FsBlobStore = require('fs-blob-store');
const BlobService = require('../lib');

const { getBase64DataURI } = require('dauria');
const { bufferToHash } = require('../lib/util');

describe('feathers-blob-store-basic', () => {
  const content = Buffer.from('hello world!');
  const contentHash = bufferToHash(content);
  const contentType = 'text/plain';
  const contentUri = getBase64DataURI(content, contentType);
  const unknownContentUri = getBase64DataURI(content);
  const contentExt = 'txt';
  const contentId = `${contentHash}.${contentExt}`;
  let blobStore, store, server;

  it('is CommonJS compatible', () => {
    assert.strictEqual(typeof BlobService, 'function');
    blobStore = FsBlobStore(join(__dirname, 'blobs'));
    store = BlobService({
      Model: blobStore
    });
  });

  it('service operations with data URI input', async () => {
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

    // test failing get
    try {
      await store.get(contentId);
    } catch (err) {
      assert.ok(err, '.get() to non-existent id should error');
    }
  });

  it('service operations with buffer input', async () => {
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

    // test failing get
    try {
      await store.get(contentId);
    } catch (err) {
      assert.ok(err, '.get() to non-existent id should error');
    }
  });

  it('service operations with custom object id', async () => {
    const customId = `custom/id/${contentHash}.${contentExt}`;

    let res = await store.create({ id: customId, uri: contentUri });
    assert.strictEqual(res.id, customId);
    assert.strictEqual(res.uri, contentUri);
    assert.strictEqual(res.size, content.length);
    assert.strictEqual(res.contentType, contentType);

    // test successful get
    res = await store.get(customId);
    assert.strictEqual(res.id, customId);
    assert.strictEqual(res.uri, contentUri);
    assert.strictEqual(res.size, content.length);
    assert.strictEqual(res.contentType, contentType);

    // test successful remove
    res = await store.remove(customId);
    assert.deepStrictEqual(res, { id: customId });

    // test failing get
    try {
      await store.get(customId);
    } catch (err) {
      assert.ok(err, '.get() to non-existent id should error');
    }
  });

  it('service operations with buffer output', async () => {
    const store = BlobService({
      Model: blobStore,
      returnBuffer: true,
      returnUri: false
    });

    let res = await store.create({ buffer: content, contentType });
    assert.strictEqual(res.id, contentId);
    assert.strictEqual(res.buffer.equals(content), true);
    assert.strictEqual(res.uri, undefined);
    assert.strictEqual(res.size, content.length);
    assert.strictEqual(res.contentType, contentType);

    // test successful get
    res = await store.get(contentId);
    assert.strictEqual(res.id, contentId);
    assert.strictEqual(res.buffer.equals(content), true);
    assert.strictEqual(res.uri, undefined);
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

  it('service operations without uri output', async () => {
    const store = BlobService({
      Model: blobStore,
      returnUri: false
    });

    let res = await store.create({ buffer: content, contentType });
    assert.strictEqual(res.id, contentId);
    assert.strictEqual(res.buffer, undefined);
    assert.strictEqual(res.uri, undefined);
    assert.strictEqual(res.size, content.length);
    assert.strictEqual(res.contentType, contentType);

    // test successful get
    res = await store.get(contentId);
    assert.strictEqual(res.id, contentId);
    assert.strictEqual(res.buffer, undefined);
    assert.strictEqual(res.uri, undefined);
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

  it('service operations with custom output id field', async () => {
    const store = BlobService({
      Model: blobStore,
      id: '_id'
    });

    let res = await store.create({ id: contentId, uri: contentUri });
    assert.strictEqual(res._id, contentId);
    assert.strictEqual(res.uri, contentUri);
    assert.strictEqual(res.size, content.length);
    assert.strictEqual(res.contentType, contentType);

    // test successful get
    res = await store.get(contentId);
    assert.strictEqual(res._id, contentId);
    assert.strictEqual(res.uri, contentUri);
    assert.strictEqual(res.size, content.length);
    assert.strictEqual(res.contentType, contentType);

    // test successful remove
    res = await store.remove(contentId);
    assert.deepStrictEqual(res, { _id: contentId });

    try {
      // test failing get
      await store.get(contentId);
    } catch (err) {
      assert.ok(err, '.get() to non-existent id should error');
    }
  });

  it('service operations with custom extension and unrecognized mime type', async () => {
    const customId = `${contentHash}.zzz`;

    let res = await store.create({ id: customId, uri: unknownContentUri });
    assert.strictEqual(res.id, customId);
    assert.strictEqual(res.uri, unknownContentUri);
    assert.strictEqual(res.size, content.length);
    assert.strictEqual(res.contentType, 'application/octet-stream');

    // test successful get
    res = await store.get(customId);
    assert.strictEqual(res.id, customId);
    assert.strictEqual(res.uri, unknownContentUri);
    assert.strictEqual(res.size, content.length);
    assert.strictEqual(res.contentType, 'application/octet-stream');

    // test successful remove
    res = await store.remove(customId);
    assert.deepStrictEqual(res, { id: customId });

    try {
      // test failing get
      await store.get(customId);
    } catch (err) {
      assert.ok(err, '.get() to non-existent id should error');
    }
  });

  it('service operations without extension and unrecognized mime type', async () => {
    const customId = `${contentHash}`;

    let res = await store.create({ id: customId, uri: unknownContentUri });
    assert.strictEqual(res.id, customId);
    assert.strictEqual(res.uri, unknownContentUri);
    assert.strictEqual(res.size, content.length);
    assert.strictEqual(res.contentType, 'application/octet-stream');

    // test successful get
    res = await store.get(customId);
    assert.strictEqual(res.id, customId);
    assert.strictEqual(res.uri, unknownContentUri);
    assert.strictEqual(res.size, content.length);
    assert.strictEqual(res.contentType, 'application/octet-stream');

    // test successful remove
    res = await store.remove(customId);
    assert.deepStrictEqual(res, { id: customId });

    try {
      // test failing get
      await store.get(customId);
    } catch (err) {
      assert.ok(err, '.get() to non-existent id should error');
    }
  });

  it('service operations overriding returnUri per request', async () => {
    // default service with returnUri on
    let store = BlobService({
      Model: blobStore
    });

    // disable returnUri for create from buffer
    let res = await store.create({ buffer: content, contentType }, { query: { returnUri: false } });
    assert.strictEqual(res.uri, undefined);

    // disable returnUri for create from uri
    res = await store.create({ uri: contentUri }, { query: { returnUri: false } });
    assert.strictEqual(res.uri, undefined);

    // disable returnUri for get
    res = await store.get(contentId, { query: { returnUri: false } });
    assert.strictEqual(res.uri, undefined);

    // service with default returnBuffer turned off
    store = BlobService({
      Model: blobStore,
      returnBuffer: false,
      returnUri: false
    });

    // enable returnUri for create from buffer
    res = await store.create({ buffer: content, contentType }, { query: { returnUri: true } });
    assert.strictEqual(res.uri, contentUri);

    // enable returnUri for create from uri
    res = await store.create({ uri: contentUri }, { query: { returnUri: true } });
    assert.strictEqual(res.uri, contentUri);

    // enable returnUri for get
    res = await store.get(contentId, { query: { returnUri: true } });
    assert.strictEqual(res.uri, contentUri);
  });

  it('service operations overriding returnBuffer per request', async () => {
    // service with returnBuffer on
    let store = BlobService({
      Model: blobStore,
      returnBuffer: true,
      returnUri: false
    });

    // disable returnBuffer for create from buffer
    let res = await store.create({ buffer: content, contentType }, { query: { returnBuffer: false } });
    assert.strictEqual(res.buffer, undefined);

    // disable returnBuffer for create from uri
    res = await store.create({ uri: contentUri }, { query: { returnBuffer: false } });
    assert.strictEqual(res.buffer, undefined);

    // disable returnBuffer for get
    res = await store.get(contentId, { query: { returnBuffer: false } });
    assert.strictEqual(res.buffer, undefined);

    // service with returnBuffer turned off
    store = BlobService({
      Model: blobStore,
      returnBuffer: false,
      returnUri: false
    });

    // enable returnBuffer for create from buffer
    res = await store.create({ buffer: content, contentType }, { query: { returnBuffer: true } });
    assert.strictEqual(res.buffer.equals(content), true);

    // enable returnBuffer for create from uri
    res = await store.create({ uri: contentUri }, { query: { returnBuffer: true } });
    assert.strictEqual(res.buffer.equals(content), true);

    // enable returnBuffer for get
    res = await store.get(contentId, { query: { returnBuffer: true } });
    assert.strictEqual(res.buffer.equals(content), true);
  });

  it('service operations from client', (done) => {
    const blobStore = FsBlobStore(join(__dirname, 'blobs'));
    const store = BlobService({
      Model: blobStore
    });
    const app = express(feathers());
    app.use(bodyParser.json());
    app.configure(rest());
    app.use('/storage', store);
    server = app.listen(3030);
    server.once('listening', async _ => {
      const url = 'http://localhost:3030';
      const restClient = client()
        .configure(client.rest(url).superagent(request));
      const service = restClient.service('storage');

      const contentId = `${contentHash}.${contentExt}`;

      let res = await service.create({ uri: contentUri });
      assert.strictEqual(res.id, contentId);
      assert.strictEqual(res.uri, contentUri);
      assert.strictEqual(res.size, content.length);
      assert.strictEqual(res.contentType, contentType);

      // test successful get
      res = await service.get(contentId);
      assert.strictEqual(res.id, contentId);
      assert.strictEqual(res.uri, contentUri);
      assert.strictEqual(res.size, content.length);
      assert.strictEqual(res.contentType, contentType);

      // test create with returnUri turned off without hook (no effect)
      res = await service.create({ uri: contentUri }, { query: { returnUri: false } });
      assert.strictEqual(res.uri, contentUri);

      // test create with returnUri turned off with hook (works)
      const storage = app.service('storage');
      const { convertQueryOverrides } = require('../lib').hooks;
      storage.hooks({
        before: {
          create: [convertQueryOverrides()]
        }
      });
      res = await service.create({ uri: contentUri }, { query: { returnUri: false } });
      assert.strictEqual(res.uri, undefined);

      // test successful remove
      res = await service.remove(contentId);
      assert.deepStrictEqual(res, { id: contentId });

      try {
        // test failing get
        await service.get(contentId);
      } catch (err) {
        assert.ok(err, '.get() to non-existent id should error');
        done();
      }
    });
  });

  // Cleanup
  after(async () => {
    await server.close();
  });
});
