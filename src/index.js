import { extname } from 'path';
import Proto from 'uberproto';
// import errors from 'feathers-errors';
import { getBase64DataURI, parseDataURI } from 'dauria';
import toBuffer from 'concat-stream';
import mimeTypes from 'mime-types';
import fs from 'fs';

import { fromBuffer, bufferToHash } from './util';

class Service {
  constructor (options) {
    if (!options) {
      throw new Error('feathers-blob-store: constructor `options` must be provided');
    }

    if (!options.Model) {
      throw new Error('feathers-blob-store: constructor `options.Model` must be provided');
    }

    this.Model = options.Model;
    this.id = options.id || 'id';
  }

  extend (obj) {
    return Proto.extend(obj, this);
  }

  get (id) {
    const ext = extname(id);
    const contentType = mimeTypes.lookup(ext);

    return new Promise((resolve, reject) => {
      this.Model.createReadStream({
        key: id
      })
        .on('error', reject)
        .pipe(toBuffer(buffer => {
          const uri = getBase64DataURI(buffer, contentType);

          resolve({
            [this.id]: id,
            uri,
            size: buffer.length
          });
        }));
    });
  }

  create (body, params = {}) {
    let { id, uri } = body;
    let file = params.file;
    let hash, ext, stream;
    let size = null;

    if (uri) {
      const { buffer, MIME: contentType } = parseDataURI(uri);
      hash = bufferToHash(buffer);
      ext = mimeTypes.extension(contentType);
      stream = fromBuffer(buffer);
      size = buffer.length;
    } else if (file && file.buffer) {
      const buffer = params.file.buffer;
      const contentType = params.file.mimetype
      hash = bufferToHash(buffer);
      ext = mimeTypes.extension(contentType);
      stream = fromBuffer(buffer);
      size = file.size;
    } else if (file && file.path) {
      const contentType = params.file.mimetype
      hash = params.file.filename;
      ext = mimeTypes.extension(contentType);
      stream = fs.createReadStream(params.file.path);
      size = file.size;
    }

    id = id || `${hash}.${ext}`;

    return new Promise((resolve, reject) => {
      stream
        .pipe(this.Model.createWriteStream({
          key: id,
          params: params.s3
        }, (error) =>
          error
            ? reject(error)
            : resolve({
              [this.id]: id,
              uri: uri,
              size: size,
            })
        ))
        .on('error', reject);
    });
  }

  remove (id) {
    return new Promise((resolve, reject) => {
      this.Model.remove({
        key: id
      }, error => error ? reject(error) : resolve({ [this.id]: id }));
    });
  }
}

export default function init (options) {
  return new Service(options);
}

init.Service = Service;
