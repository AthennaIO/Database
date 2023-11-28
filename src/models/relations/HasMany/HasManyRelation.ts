/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Model } from '#src/models/Model'
import type { HasManyOptions } from '#src/types'

export class HasManyRelation {
  /**
   * Load a has many relation.
   */
  public static async load(
    model: Model,
    relation: HasManyOptions
  ): Promise<any> {
    model[relation.property] = await relation
      .model()
      .query()
      .where(relation.foreignKey as never, model[relation.primaryKey])
      .when(relation.closure, relation.closure)
      .findMany()

    return model
  }

  /**
   * Load all models that has one relation.
   */
  public static async loadAll(
    models: Model[],
    relation: HasManyOptions
  ): Promise<any[]> {
    const primaryValues = models.map(model => model[relation.primaryKey])
    const results = await relation
      .model()
      .query()
      .whereIn(relation.foreignKey as never, primaryValues)
      .when(relation.closure, relation.closure)
      .findMany()

    const map = new Map()

    results.forEach(result => {
      if (!map.has(result[relation.foreignKey])) {
        map.set(result[relation.foreignKey], [result])

        return
      }

      const array = map.get(result[relation.foreignKey])

      array.push(result)

      map.set(result[relation.foreignKey], array)
    })

    return models.map(model => {
      model[relation.property] = map.get(model[relation.primaryKey]) || []

      return model
    })
  }
}
