exports.up = async (knex) => {
  await knex.schema.alterTable("accounts", (table) => {
    table.dropColumn("state");
  });
  await knex.schema.alterTable("accounts", (table) => {
    table.integer("state_id").references("locations.id");
  });
};

exports.down = async (knex) => {
  return knex.schema.dropTable("accounts");
};
