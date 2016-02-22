if(!global._babelPolyfill) { require('babel-polyfill'); }

import Proto from 'uberproto';
import errors from 'feathers-errors';
import { getBase64DataURI, parseDataURI } from 'dauria'

// Create the service.
class Service {
  constructor(options) {
    if (!options) {
      throw new Error('S3 options have to be provided');
    }

    if (!options.Model) {
      throw new Error('S3 service `Model` needs to be provided');
    }

    this.Model = options.Model;
    this.id = options.id || 'id';
  }

  extend(obj) {
    return Proto.extend(obj, this);
  }

  get(id, params, cb) {
    const s3Params = this._s3Params(id)

    this.Model.getObject(s3Params, function (err, res) {
      if (err) { return cb(err); }

      const { Body: buffer, ContentType: contentType } = res

      const uri = getBase64DataURI(buffer, contentType);

      cb(null, {
        [this.id]: id,
        uri
      });
    }.bind(this))
  }

  update(id, body, params, cb) {
    const { uri } = body;

    var { buffer, MIME: contentType } = parseDataURI(uri);

    const s3Params = this._s3Params(id, {
      buffer,
      contentType
    })

    this.Model.putObject(s3Params, function (err, res) {
      if (err) { return cb(err); }

      cb(null, {
        [this.id]: id,
        uri
      });
    }.bind(this));
  }

  remove(id, params, cb) {
    const s3Params = this._s3Params(id)

    this.Model.deleteObject(s3Params, function (err) {
      cb(err, null)
    });
  }

  _s3Params (id, bodyParams) {
    let s3Params = {
      Key: id
    }

    if (bodyParams) {
      Object.assign(s3Params, {
        Body: bodyParams.buffer,
        ContentType: bodyParams.contentType
      })
    }

    return s3Params
  }
}

export default function init(options) {
  return new Service(options);
}

init.Service = Service;
