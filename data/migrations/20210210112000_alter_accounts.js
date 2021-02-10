exports.up = async (knex) => {
  await knex.schema.alterTable("accounts", (table) => {
    table.string("profile_img");
  });
};

exports.down = async (knex) => {
  return knex.schema.dropTable("accounts");
};
