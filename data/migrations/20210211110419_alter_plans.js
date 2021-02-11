exports.up = async (knex) => {
  await knex.schema.alterTable("plans", (table) => {
    table.string("plan").notNullable().unique().alter();
  });
};

exports.down = async (knex) => {
  return knex.schema.dropTable("plans");
};
