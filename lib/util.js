'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fromBuffer = fromBuffer;
exports.bufferToHash = bufferToHash;

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _from = require('from2');

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO publish to npm as `from2-buffer`
// create a stream from a buffer
// buffer -> stream
function fromBuffer(buffer) {
  //assert.ok(Buffer.isBuffer(buffer))

  return (0, _from2.default)(function (size, next) {
    if (buffer.length <= 0) {
      return this.push(null);
    }

    var chunk = buffer.slice(0, size);
    buffer = buffer.slice(size);

    next(null, chunk);
  });
}

function bufferToHash(buffer) {
  var hash = _crypto2.default.createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}