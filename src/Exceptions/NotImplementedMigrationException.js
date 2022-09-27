/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@secjs/utils'

export class NotImplementedMigrationException extends Exception {
  /**
   * Creates a new instance of NotImplementedMigrationException.
   *
   * @return {NotImplementedMigrationException}
   */
  constructor(migrationName) {
    const content = `Run method not implemented on seed..`

    super(
      content,
      500,
      'E_NOT_IMPLEMENTED_MIGRATION_ERROR',
      `Open your ${migrationName} migration and write your "up()" method and "down()" method.`,
    )
  }
}
