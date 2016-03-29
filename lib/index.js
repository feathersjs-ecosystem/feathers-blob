'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
//import errors from 'feathers-errors';


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
    value: function get(id, params, cb) {
      var ext = (0, _path.extname)(id);
      var contentType = _mimeTypes2.default.lookup(ext);

      this.Model.createReadStream({
        key: id
      }).on('error', cb).pipe((0, _concatStream2.default)(function (buffer) {
        var _cb;

        var uri = (0, _dauria.getBase64DataURI)(buffer, contentType);

        cb(null, (_cb = {}, _defineProperty(_cb, this.id, id), _defineProperty(_cb, 'uri', uri), _defineProperty(_cb, 'size', buffer.length), _cb));
      }.bind(this)));
    }
  }, {
    key: 'create',
    value: function create(body, params, cb) {
      var uri = body.uri;

      var _parseDataURI = (0, _dauria.parseDataURI)(uri);

      var buffer = _parseDataURI.buffer;
      var contentType = _parseDataURI.MIME;

      var hash = (0, _util.bufferToHash)(buffer);
      var ext = _mimeTypes2.default.extension(contentType);
      var id = hash + '.' + ext;

      (0, _util.fromBuffer)(buffer).pipe(this.Model.createWriteStream({
        key: id
      }, function () {
        var _cb2;

        cb(null, (_cb2 = {}, _defineProperty(_cb2, this.id, id), _defineProperty(_cb2, 'uri', uri), _defineProperty(_cb2, 'size', buffer.length), _cb2));
      }.bind(this))).on('error', cb);
    }
  }, {
    key: 'remove',
    value: function remove(id, params, cb) {
      this.Model.remove({
        key: id
      }, function (err) {
        cb(err, null);
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