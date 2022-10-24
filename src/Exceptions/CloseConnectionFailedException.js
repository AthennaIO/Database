/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class CloseConnectionFailedException extends Exception {
  /**
   * Creates a new instance of CloseConnectionFailedException.
   *
   * @return {CloseConnectionFailedException}
   */
  constructor(driverName, error) {
    const content = `Error occurred when trying to close the connection with database for ${driverName} driver.`

    super(
      content,
      500,
      'E_CLOSE_CONNECTION_FAILED_ERROR',
      `${JSON.stringify(error, null, 2)}`,
    )
  }
}
