import { createHash, getRandomValues } from 'node:crypto';

export default function generateSalt(): string {
  const array = new Uint8Array(16);
  getRandomValues(array);
  return createHash('sha256')
    .update(
      Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(''),
    )
    .update(String(Date.now()))
    .digest('hex');
}
