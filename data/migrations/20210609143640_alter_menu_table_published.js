exports.up = async (knex) => {
  await knex.schema.alterTable("outletvenuemenus", (table) => {
    table.dropColumn("is_published");
  });
  await knex.schema.alterTable("outletvenuemenus", (table) => {
    table.boolean("is_published").defaultTo(false);
  });
};
exports.down = async (knex) => {
  await knex.schema.dropTable("outletvenuemenus");
};
