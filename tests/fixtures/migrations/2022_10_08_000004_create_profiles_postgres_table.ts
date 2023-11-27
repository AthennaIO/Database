/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { DatabaseImpl, Migration } from '#src'

export class ProfileMigration extends Migration {
  public static connection() {
    return 'postgres-docker'
  }

  public tableName = 'profiles'

  public async up(db: DatabaseImpl) {
    return db.createTable(this.tableName, table => {
      table.increments('id')
      table.integer('userId').unsigned().index().references('id').inTable('users')
      table.timestamps(true, true, true)
      table.dateTime('deletedAt').nullable().defaultTo(null)
    })
  }

  public async down(db: DatabaseImpl) {
    return db.dropTable(this.tableName)
  }
}
