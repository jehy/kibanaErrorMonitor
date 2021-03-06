function up(knex, Promise) {
  return knex.schema.createTable('slack_bot', (t) => {
    t.increments('id').unsigned().primary();
    t.string('msgName').notNullable();
    t.string('typeErr').notNullable();
    t.dateTime('added').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
  });
}

function down(knex, Promise) {
  return knex.schema.dropTableIfExists('slack_bot');
}

module.exports = {up, down};
