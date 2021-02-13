exports.up = async (knex) => {
  await knex.schema.alterTable("accounts", (table) => {
    table.string("state");
    table.string("city");
    table.string("street");
  });
};

exports.down = async (knex) => {
  return knex.schema.dropTable("accounts");
};
