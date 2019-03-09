const AWS = require('aws-sdk');
const Store = require('s3-blob-store');
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const BlobService = require('feathers-blob');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const blobStore = Store({
  client: s3,
  bucket: 'feathers-blob-store'
});

const blobService = BlobService({
  Model: blobStore
});

// Create a feathers instance.
var app = express(feathers())
  // Turn on JSON parser for REST services
  .use(express.json())
  // Turn on URL-encoded parser for REST services
  .use(express.urlencoded({ extended: true }))
  .use('/blobs', blobService);

// A basic error handler, just like Express
app.use(function (error, req, res, next) {
  res.json(error);
});

// Start the server
module.exports = app.listen(3030);

console.log('feathers-blob-store service running on 127.0.0.1:3030');
