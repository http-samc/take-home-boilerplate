const {
  createOnUpdateTrigger,
  dropOnUpdateTrigger,
} = require("../util/db-util");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Create content table
  if (!(await knex.schema.hasTable("content"))) {
    await knex.schema.createTable("content", (t) => {
      t.string("id", 8).primary();
      t.timestamp("expiry").notNullable();
      t.boolean("isEnv").notNullable();
      t.boolean("hasPassword").notNullable();
    });
  }

  // Create fragments table with compound primary key
  if (!(await knex.schema.hasTable("fragments"))) {
    await knex.schema.createTable("fragments", (t) => {
      t.string("contentId", 8).notNullable();
      t.integer("sequence").notNullable().checkPositive();
      t.string("value");
      t.primary(["contentId", "sequence"]);
      t.foreign("contentId")
        .references("id")
        .inTable("content")
        .onDelete("CASCADE");
    });
  }

  // Add update triggers for both tables
  await createOnUpdateTrigger(knex, "content");
  await createOnUpdateTrigger(knex, "fragments");
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // Drop tables in reverse order
  await knex.schema.dropTableIfExists("fragments");
  await knex.schema.dropTableIfExists("content");

  // Drop update triggers
  await dropOnUpdateTrigger(knex, "fragments");
  await dropOnUpdateTrigger(knex, "content");
};
