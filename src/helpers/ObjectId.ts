/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is, Module } from '@athenna/common'

const mongoose = await Module.safeImport('mongoose')

export class ObjectId {
  /**
   * Validate if is a valid object id.
   */
  public static isValid(objectId: any): boolean {
    if (!mongoose) {
      return false
    }

    // eslint-disable-next-line
    return mongoose.isValidObjectId(objectId) && new mongoose.Types.ObjectId(objectId) == objectId
  }

  /**
   * Validate if is a valid object id string or ObjectID object.
   */
  public static isValidStringOrObject(objectId: any): boolean {
    return this.isValidString(objectId) || this.isValidObject(objectId)
  }

  /**
   * Validate if is a valid object id string.
   */
  public static isValidString(objectId: any): boolean {
    if (!mongoose) {
      return false
    }

    return Is.String(objectId) && this.isValid(objectId)
  }

  /**
   * Swap the value for an objectId instance if valid.
   * If not valid, return the value.
   */
  public static ifValidSwap(value: any) {
    if (ObjectId.isValidString(value)) {
      return new ObjectId(value)
    }

    return value
  }

  /**
   * Validate if is a valid object id object.
   */
  public static isValidObject(objectId: any): boolean {
    if (!mongoose) {
      return false
    }

    return (
      !Is.Number(objectId) &&
      !Is.String(objectId) &&
      mongoose.isValidObjectId(objectId)
    )
  }

  public constructor(value: any) {
    return new mongoose.Types.ObjectId(value)
  }
}
