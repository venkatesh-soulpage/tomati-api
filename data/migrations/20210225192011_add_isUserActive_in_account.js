exports.up = async (knex) => {
  await knex.schema.alterTable("accounts", (table) => {
    table.boolean("is_subscription_active").defaultTo(false);
  });
};

exports.down = async (knex) => {
  return knex.schema.dropTable("accounts");
};
