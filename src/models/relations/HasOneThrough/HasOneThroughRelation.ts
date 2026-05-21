/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { BaseModel } from '#src/models/BaseModel'
import type { HasOneThroughOptions } from '#src/types'
import type { Driver } from '#src/database/drivers/Driver'
import { HasManyThroughRelation } from '#src/models/relations/HasManyThrough/HasManyThroughRelation'

export class HasOneThroughRelation {
  /**
   * Load a has one through relation.
   */
  public static async load(
    model: BaseModel,
    relation: HasOneThroughOptions
  ): Promise<any> {
    await HasManyThroughRelation.load(model, relation as any)

    const arr = (model[relation.property] as any[]) || []

    model[relation.property] = arr[0] ?? null

    return model
  }

  /**
   * Load all models that has one through relation.
   */
  public static async loadAll(
    models: BaseModel[],
    relation: HasOneThroughOptions
  ): Promise<any[]> {
    const result = await HasManyThroughRelation.loadAll(
      models,
      relation as any
    )

    return result.map(m => {
      const arr = (m[relation.property] as any[]) || []

      m[relation.property] = arr[0] ?? null

      return m
    })
  }

  /**
   * Apply a where has relation to the query when the given model
   * has one through relation.
   */
  public static whereHas(
    Model: typeof BaseModel,
    query: Driver,
    relation: HasOneThroughOptions
  ) {
    return HasManyThroughRelation.whereHas(Model, query, relation as any)
  }
}
