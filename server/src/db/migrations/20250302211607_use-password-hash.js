const {
  createOnUpdateTrigger,
  dropOnUpdateTrigger,
} = require("../util/db-util");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("content", (t) => {
    t.string("passwordHash").nullable();
    t.dropColumn("hasPassword");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("content", (t) => {
    t.boolean("hasPassword").notNullable().defaultTo(false);
    t.dropColumn("passwordHash");
  });
};
