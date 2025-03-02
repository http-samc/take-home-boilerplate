import crypto from "crypto";
import hash from "./hash";

// The encryption algorithm we're using.
const ALGORITHM = "aes256";

export function getEncryptionKey(contentSlug: string, password?: string) {
  const base = `${contentSlug}_${password ?? "none"}`;
  return Buffer.from(hash(base).substring(0, 64), "hex");
}

export function encrypt(text: string, key: Buffer<ArrayBuffer>): string {
  const cipher = crypto.createCipheriv(ALGORITHM, key, Buffer.alloc(16, 0));
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decrypt(
  encryptedText: string,
  key: Buffer<ArrayBuffer>
): string {
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.alloc(16, 0));
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
