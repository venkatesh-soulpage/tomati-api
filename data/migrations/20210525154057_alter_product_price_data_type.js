exports.up = async (knex) => {
  await knex.schema.alterTable("outletvenuemenus", (table) => {
    table.dropColumn("price");
  });
  await knex.schema.alterTable("outletvenuemenus", (table) => {
    table.float("price");
  });
};
exports.down = async (knex) => {
  await knex.schema.dropTable("outletvenuemenus");
};
