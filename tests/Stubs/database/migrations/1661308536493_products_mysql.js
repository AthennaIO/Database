import { Migration } from '#src/index'

export class ProductMigration extends Migration {
  /**
   * Create a table instance.
   *
   * @return {string}
   */
  static get connection() {
    return 'mysql'
  }

  /**
   * Run the migrations.
   *
   * @param {import('knex').Knex} knex
   * @return {Promise<any>}
   */
  async up({ schema }) {
    return schema.createTable('products', table => {
      table.increments('id')
      table.string('name', 255)
      table.integer('price').defaultTo(0)
      table.integer('userId').unsigned().index().references('id').inTable('users')

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
    return schema.dropTableIfExists('products')
  }
}
