/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { DatabaseImpl, Migration } from '#src'

export class StudentMigration extends Migration {
  public static connection() {
    return 'mysql-docker'
  }

  public tableName = 'students'

  public async up(db: DatabaseImpl) {
    return db.createTable(this.tableName, table => {
      table.increments('id')
      table.string('name')
    })
  }

  public async down(db: DatabaseImpl) {
    return db.dropTable(this.tableName)
  }
}
