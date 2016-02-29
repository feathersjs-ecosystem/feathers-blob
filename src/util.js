import crypto from 'crypto';
import fromString from 'from2-string';

export function fromBuffer (buffer) {
  return fromString(buffer.toString());
}

export function bufferToHash (buffer) {
  const hash = crypto.createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}
