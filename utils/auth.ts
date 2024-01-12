import * as crypto from 'crypto';

interface HashedPassword {
  salt: string;
  password: string;
}

/**
 * Generates a hashed password using the PBKDF2 algorithm.
 *
 * @param plain - The plain text password to be hashed.
 * @param salt - Optional. The salt value used for hashing. If not provided (e.g. signup), a random salt will be generated.
 * @returns An object containing the salt and hashed password.
 */
export function pbkdf2(plain: string): HashedPassword;
export function pbkdf2(plain: string, salt: string): HashedPassword;
export function pbkdf2(
  plain: string,
  salt = crypto.randomBytes(64).toString('base64'),
): { salt: string; password: string } | { password: string } {
  return {
    salt,
    password: crypto
      .pbkdf2Sync(plain, salt, 100000, 64, 'sha512')
      .toString('base64'),
  };
}
