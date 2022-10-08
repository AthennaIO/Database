import { Migration } from '#src/index'

export class UserMigration extends Migration {
  /**
   * Create a table instance.
   *
   * @return {string}
   */
  static get connection() {
    return 'postgres'
  }

  /**
   * Run the migrations.
   *
   * @param {import('knex').Knex} knex
   * @return {Promise<any>}
   */
  async up({ schema }) {
    return schema.createTable('users', table => {
      table.increments('id')
      table.string('name')
      table.string('email').unique()
      table.timestamps(true, true, true)
      table.dateTime('deletedAt').nullable().defaultTo(null)
    })
  }

  /**
   * Reverse the migrations.
   *
   * @param {import('knex').Knex} knex
   * @return {Promise<any>}
   */
  async down({ schema }) {
    return schema.dropTableIfExists('users')
  }
}
