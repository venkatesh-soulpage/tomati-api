exports.up = async (knex) => {
  await knex.schema.alterTable("outletvenuemenus", (table) => {
    table.dropColumn("free_sides");
    table.dropColumn("paid_sides");
  });
  await knex.schema.alterTable("outletvenuemenus", (table) => {
    table.time("preperation_time");
    table.string("product_image");
  });
  await knex.schema.alterTable("outletvenues", (table) => {
    table.time("start_time");
    table.time("end_time");
    table.integer("delivery_flat_fee");
    table.integer("delivery_variable_fee");
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable("outletvenuemenus");
  await knex.schema.dropTable("outletvenues");
};
