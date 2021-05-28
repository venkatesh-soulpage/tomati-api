exports.up = async (knex) => {
  await knex.schema.alterTable("outletvenuemenus", (table) => {
    table.dropColumn("preperation_time");
    table.time("preparation_time");
  });
};
exports.down = async (knex) => {
  await knex.schema.dropTable("outletvenuemenus");
};
