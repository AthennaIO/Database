/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  COLUMNS_KEY,
  HAS_ONE_KEY,
  HAS_MANY_KEY,
  BELONGS_TO_KEY,
  BELONGS_TO_MANY_KEY
} from '#src/constants/MetadataKeys'
import type {
  RelationOptions,
  ColumnOptions,
  HasOneOptions,
  HasManyOptions,
  BelongsToOptions,
  BelongsToManyOptions
} from '#src/types'

export class Annotation {
  public static getColumnsMeta(target: any): ColumnOptions[] {
    return Reflect.getMetadata(COLUMNS_KEY, target) || []
  }

  public static defineColumnMeta(target: any, options: ColumnOptions) {
    const columns = Reflect.getMetadata(COLUMNS_KEY, target) || []

    columns.push(options)

    Reflect.defineMetadata(COLUMNS_KEY, columns, target)
  }

  public static getRelationsMeta(target: any): RelationOptions[] {
    return [
      ...this.getHasOnesMeta(target),
      ...this.getHasManyMeta(target),
      ...this.getBelongsToMeta(target),
      ...this.getBelongsToManyMeta(target)
    ]
  }

  public static getHasOnesMeta(target: any): HasOneOptions[] {
    return Reflect.getMetadata(HAS_ONE_KEY, target) || []
  }

  public static defineHasOneMeta(target: any, options: HasOneOptions) {
    const hasOne = Reflect.getMetadata(HAS_ONE_KEY, target) || []

    hasOne.push(options)

    Reflect.defineMetadata(HAS_ONE_KEY, hasOne, target)
  }

  public static getHasManyMeta(target: any): HasManyOptions[] {
    return Reflect.getMetadata(HAS_MANY_KEY, target) || []
  }

  public static defineHasManyMeta(target: any, options: HasManyOptions) {
    const hasMany = Reflect.getMetadata(HAS_MANY_KEY, target) || []

    hasMany.push(options)

    Reflect.defineMetadata(HAS_MANY_KEY, hasMany, target)
  }

  public static getBelongsToMeta(target: any): BelongsToOptions[] {
    return Reflect.getMetadata(BELONGS_TO_KEY, target) || []
  }

  public static defineBelongsToMeta(target: any, options: BelongsToOptions) {
    const belongsTo = Reflect.getMetadata(BELONGS_TO_KEY, target) || []

    belongsTo.push(options)

    Reflect.defineMetadata(BELONGS_TO_KEY, belongsTo, target)
  }

  public static getBelongsToManyMeta(target: any): BelongsToManyOptions[] {
    return Reflect.getMetadata(BELONGS_TO_MANY_KEY, target) || []
  }

  public static defineBelongsToManyMeta(
    target: any,
    options: BelongsToManyOptions
  ) {
    const belongsToMany = Reflect.getMetadata(BELONGS_TO_MANY_KEY, target) || []

    belongsToMany.push(options)

    Reflect.defineMetadata(BELONGS_TO_MANY_KEY, belongsToMany, target)
  }
}
