/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class NotImplementedMethodException extends Exception {
  /**
   * Creates a new instance of NotImplementedMethodException.
   *
   * @return {NotImplementedMethodException}
   */
  constructor(methodName, className) {
    const content = `The method ${methodName} has not been implemented by the class ${className}.`

    super(
      content,
      500,
      'E_NOT_IMPLEMENTED_METHOD_ERROR',
      `For some reason the "${methodName}" method has not been implemented in the "${className}" class, this might be a bug or for some reason the "${className}" class does not need the implementation of this method. If you think this might be a bug, consider opening an issue at: https://github.com/athennaio/database.`,
    )
  }
}
