exports.up = async (knex) => {
  await knex.schema.alterTable("outletvenuemenus", (table) => {
    table.dropColumn("menu_category");
  });
  await knex.schema.alterTable("product_menu_category", (table) => {
    table.dropColumn("name");
    table.dropColumn("sequence");
  });
  await knex.schema.alterTable("product_menu_category", (table) => {
    table.string("name").notNullable();
    table.integer("sequence");
  });
};

exports.down = async (knex) => {
  await knex.schema.table("outletvenuemenus", (table) => {
    table.dropColumn("menu_category");
  });
  await knex.schema.dropTable("product_menu_category");
};
