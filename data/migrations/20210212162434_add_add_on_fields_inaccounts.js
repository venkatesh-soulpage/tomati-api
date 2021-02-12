exports.up = async (knex) => {
  await knex.schema.alterTable("accounts", (table) => {
    table.integer("no_of_events");
    table.integer("no_of_users");
  });
};

exports.down = async (knex) => {
  return knex.schema.dropTable("accounts");
};
