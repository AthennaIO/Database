/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { DatabaseImpl, Migration } from '#src'

export class ProductMigration extends Migration {
  public static connection() {
    return 'sqlite-memory'
  }

  public tableName = 'products'

  public async up(db: DatabaseImpl) {
    return db.createTable(this.tableName, table => {
      table.increments('id')
      table.string('name', 255)
      table.integer('price').defaultTo(0)
      table.integer('userId').unsigned().index().references('id').inTable('users')

      table.timestamps(true, true, true)
      table.dateTime('deletedAt').nullable().defaultTo(null)
    })
  }

  public async down(db: DatabaseImpl) {
    return db.dropTable(this.tableName)
  }
}
