import AWS from 'aws-sdk';
import Store from 's3-blob-store'
import feathers from 'feathers';
import rest from 'feathers-rest';
import bodyParser from 'body-parser';
import BlobService from '../src';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const blobStore = Store({
  client: s3,
  bucket: 'feathers-blob-store'
});

const blobService = BlobService({
  Model: blobStore
});

// Create a feathers instance.
var app = feathers()
  // Enable REST services
  .configure(rest())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({extended: true}))
  .use('/blobs', blobService);

// A basic error handler, just like Express
app.use(function(error, req, res, next){
  res.json(error);
});

// Start the server
module.exports = app.listen(3030);

console.log('feathers-blob-store service running on 127.0.0.1:3030');
