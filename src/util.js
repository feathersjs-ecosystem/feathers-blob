import crypto from 'crypto';
import from from 'from2';

// TODO publish to npm as `from2-buffer`
// create a stream from a buffer
// buffer -> stream
export function fromBuffer (buffer) {
  //assert.ok(Buffer.isBuffer(buffer))

  return from(function (size, next) {
    if (buffer.length <= 0) {
      return this.push(null);
    }

    const chunk = buffer.slice(0, size);
    buffer = buffer.slice(size);

    next(null, chunk);
  });
}

export function bufferToHash (buffer) {
  const hash = crypto.createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}
