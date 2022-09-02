/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@secjs/utils'

export class NotImplementedSchemaException extends Exception {
  /**
   * Creates a new instance of NotImplementedSchemaException.
   *
   * @return {NotImplementedSchemaException}
   */
  constructor(modelName) {
    const content = `You have not implemented the "static schema()" method inside your ${modelName} model.`

    super(
      content,
      500,
      'E_NOT_IMPLEMENTED_SCHEMA_ERROR',
      `Open your ${modelName} model and write your "static schema()" method using the "Column" class from @athenna/database package.`,
    )
  }
}
