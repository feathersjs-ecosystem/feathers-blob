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

  it('service operations with data URI', () => {
    return store.create({ uri: contentUri }).then(res => {
      assert.strictEqual(res.id, contentId);
      assert.strictEqual(res.uri, contentUri);
      assert.strictEqual(res.size, content.length);

      // test successful get
      return store.get(contentId);
    }).then(res => {
      assert.strictEqual(res.id, contentId);
      assert.strictEqual(res.uri, contentUri);
      assert.strictEqual(res.size, content.length);

      // test successful remove
      return store.remove(contentId);
    }).then(res => {
      assert.deepStrictEqual(res, { id: contentId });

      // test failing get
      return store.get(contentId)
        .catch(err => assert.ok(err, '.get() to non-existent id should error'));
    });
  });

  it('service operations with buffer', () => {
    return store.create({ buffer: content, contentType }).then(res => {
      assert.strictEqual(res.id, contentId);
      assert.strictEqual(res.uri, contentUri);
      assert.strictEqual(res.size, content.length);

      // test successful get
      return store.get(contentId);
    }).then(res => {
      assert.strictEqual(res.id, contentId);
      assert.strictEqual(res.uri, contentUri);
      assert.strictEqual(res.size, content.length);

      // test successful remove
      return store.remove(contentId);
    }).then(res => {
      assert.deepStrictEqual(res, { id: contentId });

      // test failing get
      return store.get(contentId)
        .catch(err => assert.ok(err, '.get() to non-existent id should error'));
    });
  });

  it('service operations with custom object id', () => {
    const customId = `custom/id/${contentHash}.${contentExt}`;

    return store.create({ id: customId, uri: contentUri }).then(res => {
      assert.strictEqual(res.id, customId);
      assert.strictEqual(res.uri, contentUri);
      assert.strictEqual(res.size, content.length);

      // test successful get
      return store.get(customId);
    }).then(res => {
      assert.strictEqual(res.id, customId);
      assert.strictEqual(res.uri, contentUri);
      assert.strictEqual(res.size, content.length);

      // test successful remove
      return store.remove(customId);
    }).then(res => {
      assert.deepStrictEqual(res, { id: customId });

      // test failing get
      return store.get(customId).catch(err =>
        assert.ok(err, '.get() to non-existent id should error')
      );
    });
  });

  it('service operations with returnBuffer=true and returnUri=false', () => {
    const store = BlobService({
      Model: blobStore,
      returnBuffer: true,
      returnUri: false
    });

    return store.create({ buffer: content, contentType }).then(res => {
      assert.strictEqual(res.id, contentId);
      assert.strictEqual(res.buffer.equals(content), true);
      assert.strictEqual(res.uri, undefined);
      assert.strictEqual(res.size, content.length);

      // test successful get
      return store.get(contentId);
    }).then(res => {
      assert.strictEqual(res.id, contentId);
      assert.strictEqual(res.buffer.equals(content), true);
      assert.strictEqual(res.uri, undefined);
      assert.strictEqual(res.size, content.length);

      // test successful remove
      return store.remove(contentId);
    }).then(res => {
      assert.deepStrictEqual(res, { id: contentId });

      // test failing get
      return store.get(contentId)
        .catch(err => assert.ok(err, '.get() to non-existent id should error'));
    });
  });

  it('service operations with custom output id field', () => {
    const store = BlobService({
      Model: blobStore,
      id: '_id'
    });

    return store.create({ id: contentId, uri: contentUri }).then(res => {
      assert.strictEqual(res._id, contentId);
      assert.strictEqual(res.uri, contentUri);
      assert.strictEqual(res.size, content.length);

      // test successful get
      return store.get(contentId);
    }).then(res => {
      assert.strictEqual(res._id, contentId);
      assert.strictEqual(res.uri, contentUri);
      assert.strictEqual(res.size, content.length);

      // test successful remove
      return store.remove(contentId);
    }).then(res => {
      assert.deepStrictEqual(res, { _id: contentId });

      // test failing get
      return store.get(contentId).catch(err =>
        assert.ok(err, '.get() to non-existent id should error')
      );
    });
  });

  it('service operations with custom extension and unrecognized mime type', () => {
    const customId = `${contentHash}.zzz`;

    return store.create({ id: customId, uri: unknownContentUri }).then(res => {
      assert.strictEqual(res.id, customId);
      assert.strictEqual(res.uri, unknownContentUri);
      assert.strictEqual(res.size, content.length);

      // test successful get
      return store.get(customId);
    }).then(res => {
      assert.strictEqual(res.id, customId);
      assert.strictEqual(res.uri, unknownContentUri);
      assert.strictEqual(res.size, content.length);

      // test successful remove
      return store.remove(customId);
    }).then(res => {
      assert.deepStrictEqual(res, { id: customId });

      // test failing get
      return store.get(customId)
        .catch(err => assert.ok(err, '.get() to non-existent id should error'));
    });
  });

  it('service operations without extension and unrecognized mime type', () => {
    const customId = `${contentHash}`;

    return store.create({ id: customId, uri: unknownContentUri }).then(res => {
      assert.strictEqual(res.id, customId);
      assert.strictEqual(res.uri, unknownContentUri);
      assert.strictEqual(res.size, content.length);

      // test successful get
      return store.get(customId);
    }).then(res => {
      assert.strictEqual(res.id, customId);
      assert.strictEqual(res.uri, unknownContentUri);
      assert.strictEqual(res.size, content.length);

      // test successful remove
      return store.remove(customId);
    }).then(res => {
      assert.deepStrictEqual(res, { id: customId });

      // test failing get
      return store.get(customId)
        .catch(err => assert.ok(err, '.get() to non-existent id should error'));
    });
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
    server.once('listening', _ => {
      const url = 'http://localhost:3030';
      const restClient = client()
        .configure(client.rest(url).superagent(request));
      const service = restClient.service('storage');

      const contentId = `${contentHash}.${contentExt}`;

      service.create({ uri: contentUri }).then(res => {
        assert.strictEqual(res.id, contentId);
        assert.strictEqual(res.uri, contentUri);
        assert.strictEqual(res.size, content.length);

        // test successful get
        return service.get(contentId);
      }).then(res => {
        assert.strictEqual(res.id, contentId);
        assert.strictEqual(res.uri, contentUri);
        assert.strictEqual(res.size, content.length);

        // test successful remove
        return service.remove(contentId);
      }).then(res => {
        assert.deepStrictEqual(res, { id: contentId });

        // test failing get
        return service.get(contentId)
          .catch(err => assert.ok(err, '.get() to non-existent id should error'));
      }).then(done);
    });
  });

  // Cleanup
  after(async () => {
    await server.close();
  });
});
