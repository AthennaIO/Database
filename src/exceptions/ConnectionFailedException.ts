/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class ConnectionFailedException extends Exception {
  public constructor(con: string, driver: string, error: any) {
    const message = `Error occurred when trying to connect to database using ${con} connection and ${driver} driver.`

    super({
      message,
      code: 'E_CONNECTION_FAILED_ERROR',
      help: `Original error: ${JSON.stringify(error, null, 2)}`
    })
  }
}
