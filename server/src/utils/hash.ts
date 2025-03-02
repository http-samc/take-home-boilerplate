import crypto from "crypto";

/**
 * Perform a salted hash.
 * @param text The text to hash.
 * @returns The salted hash of the text.
 */
export default function hash(text: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(`${text}_${process.env.SALT}`);
  return hash.digest("hex");
}
