/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Migration } from '#src/database/migrations/Migration'
import type { DatabaseImpl } from '#src/database/DatabaseImpl'

export class OrdersDockerMigration extends Migration {
  public static connection() {
    return 'postgres-docker'
  }

  public tableName = 'orders'

  public async up(db: DatabaseImpl): Promise<void> {
    await db.createTable(this.tableName, builder => {
      builder.string('id').primary()
    })
  }

  public async down(db: DatabaseImpl): Promise<void> {
    await db.dropTable(this.tableName)
  }
}
