/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'

import {
  COLUMNS_KEY,
  HOOKS_KEY,
  HAS_ONE_KEY,
  HAS_MANY_KEY,
  HAS_ONE_THROUGH_KEY,
  HAS_MANY_THROUGH_KEY,
  BELONGS_TO_KEY,
  BELONGS_TO_MANY_KEY
} from '#src/constants/MetadataKeys'
import type {
  RelationOptions,
  ColumnOptions,
  ModelHookOptions,
  HasOneOptions,
  HasManyOptions,
  HasOneThroughOptions,
  HasManyThroughOptions,
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

  /**
   * Get the lifecycle hooks of the model, including the ones inherited
   * from parent models. Hooks are returned in firing order: parent
   * class hooks first, each class in declaration order.
   *
   * Metadata is intentionally read per-class (own metadata) and merged
   * by walking the prototype chain: `Reflect.getMetadata()` alone would
   * return only the closest metadata in the chain, either hiding parent
   * hooks or (worse) leaking child hooks into the parent when the child
   * pushes into the parent's inherited array.
   */
  public static getHooksMeta(target: any): ModelHookOptions[] {
    const hooks: ModelHookOptions[] = []
    let current = target

    while (current && current !== Function.prototype) {
      hooks.unshift(...(Reflect.getOwnMetadata(HOOKS_KEY, current) || []))

      current = Object.getPrototypeOf(current)
    }

    return hooks
  }

  public static defineHookMeta(target: any, options: ModelHookOptions) {
    const hooks = Reflect.getOwnMetadata(HOOKS_KEY, target) || []

    hooks.push(options)

    Reflect.defineMetadata(HOOKS_KEY, hooks, target)
  }

  public static getRelationsMeta(target: any): RelationOptions[] {
    return [
      ...this.getHasOnesMeta(target),
      ...this.getHasManyMeta(target),
      ...this.getHasOneThroughMeta(target),
      ...this.getHasManyThroughMeta(target),
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

  public static getHasOneThroughMeta(target: any): HasOneThroughOptions[] {
    return Reflect.getMetadata(HAS_ONE_THROUGH_KEY, target) || []
  }

  public static defineHasOneThroughMeta(
    target: any,
    options: HasOneThroughOptions
  ) {
    const hasOneThrough = Reflect.getMetadata(HAS_ONE_THROUGH_KEY, target) || []

    hasOneThrough.push(options)

    Reflect.defineMetadata(HAS_ONE_THROUGH_KEY, hasOneThrough, target)
  }

  public static getHasManyThroughMeta(target: any): HasManyThroughOptions[] {
    return Reflect.getMetadata(HAS_MANY_THROUGH_KEY, target) || []
  }

  public static defineHasManyThroughMeta(
    target: any,
    options: HasManyThroughOptions
  ) {
    const hasManyThrough =
      Reflect.getMetadata(HAS_MANY_THROUGH_KEY, target) || []

    hasManyThrough.push(options)

    Reflect.defineMetadata(HAS_MANY_THROUGH_KEY, hasManyThrough, target)
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
