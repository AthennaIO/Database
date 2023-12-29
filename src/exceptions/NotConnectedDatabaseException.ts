/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class NotConnectedDatabaseException extends Exception {
  public constructor() {
    const message = 'Database is not connected to perform queries.'

    super({
      message,
      code: 'E_NOT_CONNECTED_ERROR',
      help: `Remember to call "connect()" method before starting performing queries.`
    })
  }
}
