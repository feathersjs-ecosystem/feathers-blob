const crypto = require('crypto');
const from = require('from2');

exports.fromBuffer = function fromBuffer (buffer) {
  // assert.ok(Buffer.isBuffer(buffer))

  return from(function (size, next) {
    if (buffer.length <= 0) {
      return this.push(null);
    }

    const chunk = buffer.slice(0, size);
    buffer = buffer.slice(size);

    next(null, chunk);
  });
};

exports.bufferToHash = function bufferToHash (buffer) {
  const hash = crypto.createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
};
