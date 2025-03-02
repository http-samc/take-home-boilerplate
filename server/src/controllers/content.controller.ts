import hash from "@app/utils/hash";
import { Fragment, Content } from "../../../types";
import { db } from "../db/knex";

/**
 * Creates a Content entry with specified metadata.
 * @param expiry The expiry Date of the Content.
 * @param isEnv Whether or not the Content is a .env file.
 * @param password [Optional] A password to further secure the content.
 * @returns {string} The contentSlug corresponding to the created Content.
 */
export async function createContent(
  expiry: Date,
  isEnv: boolean,
  password?: string
): Promise<string> {
  const createUniqueSlug = async () => {
    // Slug generation function for an 8 character alphanumeric string
    const generateSlug = () => {
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      return Array.from(
        { length: 8 },
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join("");
    };

    // Keep generating slugs until we find a unique one
    while (true) {
      const slug = generateSlug();
      const contentId = hash(slug).substring(0, 8);
      const existing = await db("content").where({ id: contentId }).first();
      if (!existing) {
        return { contentSlug: slug, id: contentId };
      }
    }
  };

  const { contentSlug, id } = await createUniqueSlug();
  const passwordHash = password ? hash(password) : null;
  console.log(id);
  const content = await db("content").insert({
    id,
    expiry,
    isEnv,
    passwordHash,
  });

  return contentSlug;
}

/**
 * Fetches Content from a slug and password.
 * @param contentSlug The url slug for the requested Content.
 * @param password [Optional] The password, if any, for the Content.
 * @returns {Content | null} Returns null for an invalid slug, password, or expiration error.
 */
export async function fetchContent(
  contentSlug: string,
  password?: string
): Promise<Content | null> {
  const contentId = hash(contentSlug).substring(0, 8);
  const passwordHash = password ? hash(password) : null;

  const content: Content | undefined = await db("content")
    .where({ id: contentId })
    .where(function () {
      this.where("passwordHash", null).orWhere("passwordHash", passwordHash);
    })
    .where("expiry", ">", new Date().getTime())
    .first();

  return content ?? null;
}
