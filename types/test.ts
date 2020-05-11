import createBlobService, { Service, BlobResult, RemoveResult } from 'feathers-blob';
import { AbstractBlobStore } from 'abstract-blob-store';

const blobStore = {} as any as AbstractBlobStore;

// $ExpectType Service
const service = createBlobService({
  Model: blobStore,
  returnBuffer: true,
  id: 'other',
});

// $ExpectError
createBlobService({});

const buffer = Buffer.from('test');

// $ExpectType Promise<BlobResult>
service.create({ uri: 'data://...' }, { s3: { ACL: 'public-read' }});
// $ExpectType Promise<BlobResult>
service.create({ buffer, contentType: 'text/plain' }, { s3: { ACL: 'public-read' }});

// $ExpectError
service.create({ buffer }); // missing contentType

// $ExpectError
service.create({ other: 'something' }); // missing uri or buffer

// $ExpectType Promise<BlobResult>
service.get('name.txt', { s3: { ACL: 'public-read' }});

// $ExpectType Promise<RemoveResult>
service.remove('name.txt');
