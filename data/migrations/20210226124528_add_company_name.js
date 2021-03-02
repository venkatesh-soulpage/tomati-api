exports.up = async (knex) => {
  await knex.schema.alterTable("accounts", (table) => {
    table.string("company_name");
  });
};

exports.down = async (knex) => {
  return knex.schema.dropTable("accounts");
};
