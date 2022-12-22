/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class NotImplementedMigrationException extends Exception {
  /**
   * Creates a new instance of NotImplementedMigrationException.
   *
   * @return {NotImplementedMigrationException}
   */
  constructor(migrationName) {
    const content = `The up and down methods are not implemented on migration.`

    super(
      content,
      500,
      'E_NOT_IMPLEMENTED_MIGRATION_ERROR',
      `Open your ${migrationName} migration and write your "up()" method and "down()" method.`,
    )
  }
}
