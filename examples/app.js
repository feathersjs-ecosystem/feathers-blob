import AWS from 'aws-sdk';
import feathers from 'feathers';
import rest from 'feathers-rest';
import bodyParser from 'body-parser';
import service from '../src';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  params: {
    Bucket: 'feathers-s3'
  }
});

const blobService = service({
  Model: s3,
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

console.log('Feathers Blob S3 service running on 127.0.0.1:3030');
