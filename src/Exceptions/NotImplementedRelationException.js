/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class NotImplementedRelationException extends Exception {
  /**
   * Creates a new instance of NotImplementedRelationException.
   *
   * @return {NotImplementedRelationException}
   */
  constructor(relationName, modelName, availableRelations) {
    const content = `You have not implemented the "${relationName}" relation property in your "static schema()" method inside your ${modelName} model.`

    super(
      content,
      500,
      'E_NOT_IMPLEMENTED_RELATION_ERROR',
      `Available relations for ${modelName} model: ${availableRelations}. Open your ${modelName} model and write your "${relationName}" relation property inside of your "static schema()" method.`,
    )
  }
}
