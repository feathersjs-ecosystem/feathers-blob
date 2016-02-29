# feathers-blob-store

[![Build Status](https://travis-ci.org/ahdinosaur/feathers-blob-store.png?branch=master)](https://travis-ci.org/ahdinosaur/feathers-blob-store)

> [Feathers](http://feathersjs.com) [`abstract blob store`](https://github.com/maxogden/abstract-blob-store) service

## Installation

```shell
npm install feathers-blob-store --save
```

Also install a [`abstract-blob-store` compatible module](https://github.com/maxogden/abstract-blob-store#some-modules-that-use-this).


## API

### `import BlobStore from 'feathers-blob-store'`

### `blobStore = BlobStore(options)`

- `options.Model` is an instantiated interface [that implements the `abstract-blob-store` API)
- `options.id` is a string 'key' for the blob identifier.

### `blobStore.create(body, params)`

where input `body` is an object with key `uri` pointing to [data URI](https://en.wikipedia.org/wiki/Data_URI_scheme) of the blob.

returns output 'data' of the form:

```js
{
  [this.id]: `${hash(content)}.${extension(contentType)}`,
  uri: body.uri,
  size: length(content)
}
```

### `blobStore.get(id, params)`

returns output `data` of the same form as `create`.

### `blobStore.remove(id, params)`

## Example

```js
import { getBase64DataURI } from 'dauria';
import BlobStore from 'feathers-blob-store';
import AWS from 'aws-sdk';
import S3BlobStore from 's3-blob-store';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const blobStore = S3BlobStore({
  client: s3,
  bucket: 'feathers-blob-store'
});

const blobService = service({
  Model: blobStore
});

const blob = {
  uri: getBase64DataURI(new Buffer('hello world'), 'text/plain')
}

app.service('blobs').create(blob).then(function (result) {
  console.log('Stored blob with id', result.id);
}).catch(err => {
  console.error(err);
});
```

For a more complete example, see [examples/app](./examples/app.js) which can be run with `npm run example`.


## Changelog

__0.2.0__

- Generalize using [`abstract-blob-store`](https://github.com/maxogden/abstract-blob-store)

__0.1.0__

- Initial release for `AWS.S3` using `aws-sdk`

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
