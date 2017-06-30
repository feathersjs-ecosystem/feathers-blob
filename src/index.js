import { extname } from 'path';
import Proto from 'uberproto';
// import errors from 'feathers-errors';
import { getBase64DataURI, parseDataURI } from 'dauria';
import toBuffer from 'concat-stream';
import mimeTypes from 'mime-types';

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
    const { buffer, MIME: contentType } = parseDataURI(uri);
    const hash = bufferToHash(buffer);
    const ext = mimeTypes.extension(contentType);

    id = id || `${hash}.${ext}`;

    return new Promise((resolve, reject) => {
      fromBuffer(buffer)
        .pipe(this.Model.createWriteStream({
          key: id,
          params: params.s3
        }, (error) =>
          error
            ? reject(error)
            : resolve({
              [this.id]: id,
              uri,
              size: buffer.length
            })
        ))
        .on('error', reject);
    });
  }

  remove (id) {
    return new Promise((resolve, reject) => {
      this.Model.remove({
        key: id
      }, error => error ? reject(error) : resolve());
    });
  }
}

export default function init (options) {
  return new Service(options);
}

init.Service = Service;
