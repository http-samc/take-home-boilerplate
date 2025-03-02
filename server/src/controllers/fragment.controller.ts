import { decrypt, encrypt, getEncryptionKey } from "@app/utils/encryption";
import { Fragment } from "../../../types";
import { db } from "../db/knex";
import hash from "@app/utils/hash";

// Control the maximum amount of characters a fragment can contain when unencrypted
const MAX_FRAGMENT_RAW_LENGTH = 25;

/**
 * Converts raw text to a fragmented representation and persists it securely in the database.
 * @param text The text to process.
 * @param contentSlug The url slug of the Content the text belongs to.
 * @param password [Optional] A password to further secure the text.
 * @throws {Error} If there is a transaction error when inserting fragments.
 */
export async function insertFragments(
  text: string,
  contentSlug: string,
  password?: string
) {
  const contentId = hash(contentSlug).substring(0, 8);
  const key = getEncryptionKey(contentSlug, password);

  // Split text into fragments of maximum length
  const fragments: Fragment[] = [];
  let sequence = 1;

  for (let i = 0; i < text.length; i += MAX_FRAGMENT_RAW_LENGTH) {
    fragments.push({
      contentId,
      sequence,
      value: encrypt(text.slice(i, i + MAX_FRAGMENT_RAW_LENGTH), key),
    });
    sequence++;
  }

  // Start a transaction to ensure fragments are inserted atomically
  const trx = await db.transaction();

  try {
    await trx("fragments").insert(
      fragments.map((fragment) => ({
        contentId,
        sequence: fragment.sequence,
        value: fragment.value,
      }))
    );

    await trx.commit();
  } catch (error) {
    // Rollback the transaction if anything fails
    await trx.rollback();
    throw Error(`Fragment insertion failed: ${error}`);
  }
}

/**
 * Reconstructs the raw text for a specific Content.
 * @param contentSlug The url slug of the content being requested.
 * @param password The password, if any, for the Content.
 * @returns {string} The raw text for the Content.
 */
export async function readFragments(
  contentSlug: string,
  password?: string
): Promise<string> {
  const contentId = hash(contentSlug).substring(0, 8);
  const key = getEncryptionKey(contentSlug, password);

  // Find all fragments with the given contentId
  const fragments: Fragment[] = await db("fragments")
    .where({ contentId })
    .orderBy("sequence", "asc")
    .select("value");

  const decryptedText = fragments
    .map((fragment) => decrypt(fragment.value, key))
    .join("");

  return decryptedText;
}
