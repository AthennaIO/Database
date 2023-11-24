/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { DatabaseImpl, Migration } from '#src'

export class CountryMigration extends Migration {
  public tableName = 'countries'

  public async up(db: DatabaseImpl) {
    return db.createTable(this.tableName, table => {
      table.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'))
      table.string('name')
    })
  }

  public async down(db: DatabaseImpl) {
    return db.dropTable(this.tableName)
  }
}
