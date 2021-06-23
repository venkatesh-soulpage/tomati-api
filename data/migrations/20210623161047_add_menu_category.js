exports.up = async (knex) => {
  await knex.schema.alterTable("outletvenuemenus", (table) => {
    table.integer("menu_category").references("product_menu_category.id");
  });
  await knex.schema.dropTable("menu_category");
};

exports.down = async (knex) => {
  await knex.schema.dropTable("outletvenuemenus");
  await knex.schema.dropTable("menu_category");
};
