import { Migration } from '#src/index'

export class CountryMigration extends Migration {
  /**
   * Run the migrations.
   *
   * @param {import('knex').Knex} knex
   * @return {Promise<any>}
   */
  async up(knex) {
    return knex.schema.createTable('countries', table => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
      table.string('name')
    })
  }

  /**
   * Reverse the migrations.
   *
   * @param {import('knex').Knex} knex
   * @return {Promise<any>}
   */
  async down({ schema }) {
    return schema.dropTableIfExists('countries')
  }
}
