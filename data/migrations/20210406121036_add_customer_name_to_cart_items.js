exports.up = async (knex) => {
  await knex.schema.alterTable("cart_items", (table) => {
    table.string("customer_name");
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable("cart_items");
};
