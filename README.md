# feathers-blob

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs-ecosystem/feathers-blob.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs-ecosystem/feathers-blob.png?branch=master)](https://travis-ci.org/feathersjs-ecosystem/feathers-blob)
[![Dependency Status](https://img.shields.io/david/feathersjs-ecosystem/feathers-blob.svg?style=flat-square)](https://david-dm.org/feathersjs-ecosystem/feathers-blob)
[![Known Vulnerabilities](https://snyk.io/test/github/feathersjs-ecosystem/feathers-blob/badge.svg)](https://snyk.io/test/github/feathersjs-ecosystem/feathers-blob)
[![Download Status](https://img.shields.io/npm/dm/feathers-blob.svg?style=flat-square)](https://www.npmjs.com/package/feathers-blob)
[![Slack Status](http://slack.feathersjs.com/badge.svg)](http://slack.feathersjs.com)

> [Feathers](http://feathersjs.com) [`abstract blob store`](https://github.com/maxogden/abstract-blob-store) service

## Installation

```shell
npm install feathers-blob --save
```

Also install a [`abstract-blob-store` compatible module](https://github.com/maxogden/abstract-blob-store#some-modules-that-use-this).


## API

### `import BlobService from 'feathers-blob'`

### `blobService = BlobService(options)`

- `options.Model` is an instantiated interface [that implements the `abstract-blob-store` API](https://github.com/maxogden/abstract-blob-store#api)
- `options.id` is a string 'key' for the blob identifier.

### `blobService.create(body, params)`

where input `body` is an object with either:
* a key `uri` pointing to [data URI](https://en.wikipedia.org/wiki/Data_URI_scheme) of the blob,
* a key `buffer` pointing to [raw data buffer](https://nodejs.org/api/buffer.html) of the blob along with its `contentType` (i.e. MIME type).

Optionally, you can specify in the `body` the blob `id` which can be the file
path where you want to store the file, otherwise it would default to
`${hash(content)}.${extension(contentType)}`.

**Tip**: You can use feathers hooks to customize the `id`. You might not want the
client-side to write whereever they want.

returns output 'data' of the form:

```js
{
  [this.id]: `${hash(content)}.${extension(contentType)}`,
  uri: body.uri,
  size: length(content)
}
```

### `blobService.get(id, params)`

returns output `data` of the same form as `create`.

### `blobService.remove(id, params)`

## Example

```js
import { getBase64DataURI } from 'dauria';
import AWS from 'aws-sdk';
import S3BlobStore from 's3-blob-store';
import BlobService from 'feathers-blob';

const s3 = new AWS.S3({
  endpoint: 'https://{service}.{region}.{provider}.com',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const blobStore = S3BlobStore({
  client: s3,
  bucket: 'feathers-blob'
});

const blobService = BlobService({
  Model: blobStore
});

const blob = {
  uri: getBase64DataURI(new Buffer('hello world'), 'text/plain')
}

blobService.create(blob).then(function (result) {
  console.log('Stored blob with id', result.id);
}).catch(err => {
  console.error(err);
});
```

Should you need to change your bucket's [options](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property), such as permissions, pass a `params.s3` object using a before hook.

```js
app.service('upload').before({
  create(hook) {
    hook.params.s3 = { ACL: 'public-read' }; // makes uploaded files public
  }
});
```

For a more complete example, see [examples/app](./examples/app.js) which can be run with `npm run example`.


## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
