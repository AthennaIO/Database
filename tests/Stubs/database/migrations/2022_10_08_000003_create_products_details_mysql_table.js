import { Migration } from '#src/index'

export class ProductDetailsMigration extends Migration {
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
    return schema.createTable('product_details', table => {
      table.increments('id')
      table.string('content', 255)
      table.integer('productId').unsigned().index().references('id').inTable('products')

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
    return schema.dropTableIfExists('product_details')
  }
}
