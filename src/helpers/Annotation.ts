/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { COLUMNS_KEY, HAS_ONE_KEY } from '#src/constants/MetadataKeys'
import type { ColumnOptions } from '#src/types/columns/ColumnOptions'
import type { HasOneOptions } from '#src/types/relations/HasOneOptions'

export class Annotation {
  public static getColumnsMeta(target: any): ColumnOptions[] {
    return Reflect.getMetadata(COLUMNS_KEY, target) || []
  }

  public static defineColumnMeta(target: any, options: ColumnOptions) {
    const columns = Reflect.getMetadata(COLUMNS_KEY, target) || []

    columns.push(options)

    Reflect.defineMetadata(COLUMNS_KEY, columns, target)
  }

  public static getRelationsMeta(target: any): HasOneOptions[] {
    return [...this.getHasOnesMeta(target)]
  }

  public static getHasOnesMeta(target: any): HasOneOptions[] {
    return Reflect.getMetadata(HAS_ONE_KEY, target) || []
  }

  public static defineHasOneMeta(target: any, options: HasOneOptions) {
    const hasOnes = Reflect.getMetadata(HAS_ONE_KEY, target) || []

    hasOnes.push(options)

    Reflect.defineMetadata(HAS_ONE_KEY, hasOnes, target)
  }
}
