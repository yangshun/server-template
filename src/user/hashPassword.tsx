import { pbkdf2 } from 'node:crypto';

export async function hashPassword(
  password: string,
  salt: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    pbkdf2(password, salt, 310_000, 32, 'sha256', (error, hashedPassword) => {
      if (error) {
        return reject(error);
      }

      resolve(hashedPassword);
    });
  });
}
