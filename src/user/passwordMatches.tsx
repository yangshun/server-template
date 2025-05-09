import { timingSafeEqual } from 'node:crypto';

export default function passwordMatches(
  passwordA: Buffer | string,
  passwordB: Buffer | string,
): boolean {
  try {
    return !!timingSafeEqual(
      typeof passwordA === 'string' ? Buffer.from(passwordA, 'hex') : passwordA,
      typeof passwordB === 'string' ? Buffer.from(passwordB, 'hex') : passwordB,
    );
  } catch {
    return false;
  }
}
