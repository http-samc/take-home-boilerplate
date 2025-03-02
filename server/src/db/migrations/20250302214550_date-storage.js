exports.up = async function (knex) {
  // Convert timestamp to Unix milliseconds, then alter column type
  await knex.raw(`
    ALTER TABLE content 
    ALTER COLUMN expiry TYPE bigint 
    USING (EXTRACT(EPOCH FROM expiry) * 1000)::bigint
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // Convert Unix milliseconds back to timestamp
  await knex.raw(`
    ALTER TABLE content 
    ALTER COLUMN expiry TYPE timestamp with time zone 
    USING (to_timestamp(expiry::double precision / 1000))
  `);
};
