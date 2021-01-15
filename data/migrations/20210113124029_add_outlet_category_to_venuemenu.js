exports.up = async (knex) => {
  return knex.schema.alterTable("outletvenuemenus", (table) => {
    table.string("outlet_category");
  });
};

exports.down = async (knex) => {
  return knex.schema.table("outletvenuemenus", (table) => {
    table.dropColumn("outlet_category");
  });
};
