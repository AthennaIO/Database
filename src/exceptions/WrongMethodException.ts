/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class WrongMethodException extends Exception {
  public constructor(wrong: string, right: string) {
    const message = `The method ${wrong} should not be used to perform operations using this type of data.`

    super({
      message,
      code: 'E_WRONG_METHOD_ERROR',
      help: `Instead try using the ${right} method.`
    })
  }
}
