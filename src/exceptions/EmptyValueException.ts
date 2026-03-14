/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class EmptyValueException extends Exception {
  public constructor(method: string) {
    const message = `The value set in your query builder ${method}() operation is undefined.`

    super({
      message,
      code: 'E_EMPTY_VALUE_ERROR',
      help: `You must set a value to perform the ${method}() operation, undefined is not supported.`
    })
  }
}
