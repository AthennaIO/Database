/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class NotFoundDataException extends Exception {
  public constructor(con: string) {
    const message = 'Data not found in database.'

    super({
      message,
      status: 404,
      code: 'E_NOT_FOUND_DATA_ERROR',
      help: `Data not found in database using the using ${con} connection.`
    })
  }
}
