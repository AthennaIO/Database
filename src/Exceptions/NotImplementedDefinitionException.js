/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@secjs/utils'

export class NotImplementedDefinitionException extends Exception {
  /**
   * Creates a new instance of NotImplementedDefinitionException.
   *
   * @return {NotImplementedDefinitionException}
   */
  constructor(modelName) {
    const content = `You have not implemented the "static definition()" method inside your ${modelName} model.`

    super(
      content,
      500,
      'E_NOT_IMPLEMENTED_DEFINITION_ERROR',
      `Open your ${modelName} model and write your "static definition()" method using the "faker" method.`,
    )
  }
}
