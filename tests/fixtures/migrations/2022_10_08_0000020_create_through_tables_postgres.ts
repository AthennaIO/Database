/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { DatabaseImpl, BaseMigration } from '#src'

export class ThroughTablesMigration extends BaseMigration {
  public static connection() {
    return 'postgres-docker'
  }

  public async up(db: DatabaseImpl) {
    await db.createTable('regions', table => {
      table.increments('id')
      table.string('name')
    })

    await db.createTable('members', table => {
      table.increments('id')
      table.string('name')
      table.integer('regionId').unsigned().references('id').inTable('regions')
    })

    await db.createTable('articles', table => {
      table.increments('id')
      table.string('title')
      table.integer('memberId').unsigned().references('id').inTable('members')
    })

    await db.createTable('appointments', table => {
      table.increments('id')
      table.string('name')
    })

    await db.createTable('sales', table => {
      table.increments('id')
      table.integer('total')
    })

    await db.createTable('sale_items', table => {
      table.increments('id')
      table.integer('quantity').defaultTo(1)
      table
        .integer('appointmentId')
        .unsigned()
        .references('id')
        .inTable('appointments')
      table.integer('saleId').unsigned().references('id').inTable('sales')
    })
  }

  public async down(db: DatabaseImpl) {
    await db.dropTable('sale_items')
    await db.dropTable('sales')
    await db.dropTable('appointments')
    await db.dropTable('articles')
    await db.dropTable('members')
    await db.dropTable('regions')
  }
}
