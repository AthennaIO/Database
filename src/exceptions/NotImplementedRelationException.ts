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
  public constructor(relation: string, model: string, available: string) {
    super({
      status: 500,
      code: 'E_NOT_IMPLEMENTED_RELATION_ERROR',
      message: `The relation ${relation} is not available in model ${model}.`,
      help: `Available relations are: ${available}.`
    })
  }
}
