/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@secjs/utils'

export class ConnectionFailedException extends Exception {
  /**
   * Creates a new instance of ConnectionFailedException.
   *
   * @return {ConnectionFailedException}
   */
  constructor(conName, driverName, error) {
    const content = `Error occurred when trying to connect to database using ${conName} connection and ${driverName} driver.`

    super(
      content,
      500,
      'E_CONNECTION_FAILED_ERROR',
      `${JSON.stringify(error, null, 2)}`,
    )
  }
}
