/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { String } from '@athenna/common'
import type { Model } from '#src/models/Model'
import type { BelongsToOptions } from '#src/types'

export class BelongsToRelation {
  /**
   * Load a belongs to relation.
   */
  public static async load(
    model: Model,
    relation: BelongsToOptions
  ): Promise<any> {
    const RelationModel = relation.model()

    relation.primaryKey =
      relation.primaryKey || RelationModel.schema().getMainPrimaryKeyName()
    relation.foreignKey =
      relation.foreignKey || `${String.toCamelCase(RelationModel.name)}Id`

    model[relation.property] = await RelationModel.query()
      .where(relation.primaryKey as never, model[relation.foreignKey])
      .when(relation.closure, relation.closure)
      .find()

    return model
  }

  /**
   * Load all models that belongs to relation.
   */
  public static async loadAll(
    models: Model[],
    relation: BelongsToOptions
  ): Promise<any[]> {
    const RelationModel = relation.model()

    relation.primaryKey =
      relation.primaryKey || RelationModel.schema().getMainPrimaryKeyName()
    relation.foreignKey =
      relation.foreignKey || `${String.toCamelCase(RelationModel.name)}Id`

    const foreignValues = models.map(model => model[relation.foreignKey])
    const results = await RelationModel.query()
      .whereIn(relation.primaryKey as never, foreignValues)
      .when(relation.closure, relation.closure)
      .findMany()

    const map = new Map()

    results.forEach(result => map.set(result[relation.primaryKey], result))

    return models.map(model => {
      model[relation.property] = map.get(model[relation.foreignKey])

      return model
    })
  }
}
