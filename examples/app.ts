import { S3 } from 'aws-sdk';
// @ts-ignore
import S3BlobStore from 's3-blob-store';
import createBlobService from 'feathers-blob';
import feathers from '@feathersjs/feathers';
import express from '@feathersjs/express';

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const blobStore = S3BlobStore({
  client: s3,
  bucket: 'feathers-blob-store'
});

const blobService = createBlobService({
  Model: blobStore
});

// Create a feathers instance.
var app = express(feathers())
  // Turn on JSON parser for REST services
  .use(express.json())
  // Turn on URL-encoded parser for REST services
  .use(express.urlencoded({ extended: true }))
  .use('/blobs', blobService);

app.use(express.errorHandler());

// Start the server
module.exports = app.listen(3030);

console.log('feathers-blob-store service running on 127.0.0.1:3030');
