/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is } from '@athenna/common'
import { isValidObjectId, Types } from 'mongoose'

export class ObjectId {
  /**
   * Validate if is a valid object id.
   */
  public static isValid(objectId: any): boolean {
    // eslint-disable-next-line
    return isValidObjectId(objectId) && new Types.ObjectId(objectId) == objectId
  }

  /**
   * Validate if is a valid object id string.
   */
  public static isValidString(objectId: any): boolean {
    return Is.String(objectId) && this.isValid(objectId)
  }

  /**
   * Validate if is a valid object id object.
   */
  public static isValidObject(objectId: any): boolean {
    return (
      !Is.Number(objectId) && !Is.String(objectId) && isValidObjectId(objectId)
    )
  }

  public constructor(value: any) {
    return new Types.ObjectId(value)
  }
}
