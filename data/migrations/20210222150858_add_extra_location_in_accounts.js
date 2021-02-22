exports.up = async (knex) => {
  await knex.schema.alterTable("accounts", (table) => {
    table.string("extra_location");
  });
};

exports.down = async (knex) => {
  return knex.schema.dropTable("accounts");
};
