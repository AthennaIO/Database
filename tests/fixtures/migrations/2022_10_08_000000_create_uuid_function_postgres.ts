/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { DatabaseImpl, Migration } from '#src'

export class UuidFunctionMigration extends Migration {
  public static connection() {
    return 'postgres-docker'
  }

  public async up(db: DatabaseImpl) {
    return db.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
  }

  public async down() {}
}
