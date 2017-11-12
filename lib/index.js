'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
// import errors from 'feathers-errors';


exports.default = init;

var _path = require('path');

var _uberproto = require('uberproto');

var _uberproto2 = _interopRequireDefault(_uberproto);

var _dauria = require('dauria');

var _concatStream = require('concat-stream');

var _concatStream2 = _interopRequireDefault(_concatStream);

var _mimeTypes = require('mime-types');

var _mimeTypes2 = _interopRequireDefault(_mimeTypes);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Service = function () {
  function Service(options) {
    _classCallCheck(this, Service);

    if (!options) {
      throw new Error('feathers-blob-store: constructor `options` must be provided');
    }

    if (!options.Model) {
      throw new Error('feathers-blob-store: constructor `options.Model` must be provided');
    }

    this.Model = options.Model;
    this.id = options.id || 'id';
  }

  _createClass(Service, [{
    key: 'extend',
    value: function extend(obj) {
      return _uberproto2.default.extend(obj, this);
    }
  }, {
    key: 'get',
    value: function get(id) {
      var _this = this;

      var ext = (0, _path.extname)(id);
      var contentType = _mimeTypes2.default.lookup(ext);

      return new Promise(function (resolve, reject) {
        _this.Model.createReadStream({
          key: id
        }).on('error', reject).pipe((0, _concatStream2.default)(function (buffer) {
          var _resolve;

          var uri = (0, _dauria.getBase64DataURI)(buffer, contentType);

          resolve((_resolve = {}, _defineProperty(_resolve, _this.id, id), _defineProperty(_resolve, 'uri', uri), _defineProperty(_resolve, 'size', buffer.length), _resolve));
        }));
      });
    }
  }, {
    key: 'create',
    value: function create(body) {
      var _this2 = this;

      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var id = body.id,
          uri = body.uri;

      var _parseDataURI = (0, _dauria.parseDataURI)(uri),
          buffer = _parseDataURI.buffer,
          contentType = _parseDataURI.MIME;

      var hash = (0, _util.bufferToHash)(buffer);
      var ext = _mimeTypes2.default.extension(contentType);

      id = id || hash + '.' + ext;

      return new Promise(function (resolve, reject) {
        var mimetype = body.mimetype,
            size = body.size,
            extension = body.extension;

        (0, _util.fromBuffer)(buffer).pipe(_this2.Model.createWriteStream({
          key: id,
          params: params.s3,
          data: {
            mimetype: mimetype,
            size: size,
            extension: extension
          }
        }, function (error, modelData) {
          var _blobData;

          if (error) {
            return reject(error);
          }
          var blobData = (_blobData = {}, _defineProperty(_blobData, _this2.id, id), _defineProperty(_blobData, 'uri', uri), _defineProperty(_blobData, 'size', buffer.length), _blobData);
          resolve(Object.assign({}, blobData, modelData));
        })).on('error', reject);
      });
    }
  }, {
    key: 'remove',
    value: function remove(id) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.Model.remove({
          key: id
        }, function (error) {
          return error ? reject(error) : resolve();
        });
      });
    }
  }]);

  return Service;
}();

function init(options) {
  return new Service(options);
}

init.Service = Service;
module.exports = exports['default'];