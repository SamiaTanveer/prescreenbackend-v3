import {
  createCipheriv,
  randomBytes,
  scrypt,
  createDecipheriv,
  CipherKey,
} from 'crypto';
import { promisify } from 'util';

const pass = 'Password used to generate key';
const alg = 'aes-256-ctr';

// The key length is dependent on the algorithm.
// In this case for aes256, it is 32 bytes.
const generateKey = async () => {
  return (await promisify(scrypt)(pass, 'salt', 32)) as CipherKey;
};

export const encryptData = async (data: string) => {
  const key = await generateKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv(alg, key, iv);
  const result = Buffer.concat([iv, cipher.update(data), cipher.final()]);
  // Convert the result to a hexadecimal string
  return result.toString('hex');
};

export const decryptData = async (data: string) => {
  const key = await generateKey();
  // Convert the input string back to a Buffer
  const encryptedData = Buffer.from(data, 'hex');
  const iv = encryptedData.slice(0, 16);
  const ciphertext = encryptedData.slice(16);
  const decipher = createDecipheriv(alg, key, iv);
  const result = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return result.toString(); // Assuming the decrypted data is a string
};
