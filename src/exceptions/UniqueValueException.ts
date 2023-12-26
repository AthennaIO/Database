/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class UniqueValueException extends Exception {
  public constructor(records: Record<string, any>) {
    let values: any = Object.values(records)
    let properties: any = Object.keys(records)

    if (properties.length > 1) {
      values = values.join(', ')
      properties = properties.join(', ')
    } else {
      values = values[0]
      properties = properties[0]
    }

    super({
      status: 400,
      code: 'E_UNIQUE_VALUE_ERROR',
      message: `The properties [${properties}] is unique in database and cannot be replicated.`,
      help: `Your properties [${properties}] has the option isUnique set to true in it's model, meaning that the values [${values}] could not be used because there is another record with it in your database. Try creating your record with a different value, or set the isUnique property to false.`
    })
  }
}
