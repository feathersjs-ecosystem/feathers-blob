# feathers-blob

[![Build Status](https://travis-ci.org/feathersjs/feathers-blob.png?branch=master)](https://travis-ci.org/feathersjs/feathers-blob)

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

where input `body` is an object with key `uri` pointing to [data URI](https://en.wikipedia.org/wiki/Data_URI_scheme) of the blob.

Optionally, you can specify in the `body` the blob `key` which can be the file
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
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const blobStore = S3BlobStore({
  client: s3,
  bucket: 'feathers-blob'
});

const blobService = service({
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

For a more complete example, see [examples/app](./examples/app.js) which can be run with `npm run example`.


## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
