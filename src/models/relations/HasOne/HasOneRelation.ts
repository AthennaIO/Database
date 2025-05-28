/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { String } from '@athenna/common'
import type { HasOneOptions } from '#src/types'
import type { BaseModel } from '#src/models/BaseModel'
import type { Driver } from '#src/database/drivers/Driver'

export class HasOneRelation {
  /**
   * Load a has one relation.
   */
  public static async load(
    model: BaseModel,
    relation: HasOneOptions
  ): Promise<any> {
    model[relation.property] = await relation
      .model()
      .query()
      .where(relation.foreignKey as never, model[relation.primaryKey])
      .when(relation.closure, relation.closure)
      .find()

    return model
  }

  /**
   * Load all models that has one relation.
   */
  public static async loadAll(
    models: BaseModel[],
    relation: HasOneOptions
  ): Promise<any[]> {
    const primaryValues = models.map(model => model[relation.primaryKey])
    const results = await relation
      .model()
      .query()
      .whereIn(relation.foreignKey as never, primaryValues)
      .when(relation.closure, relation.closure)
      .findMany()

    const map = new Map()

    results.forEach(result => map.set(result[relation.foreignKey], result))

    return models.map(model => {
      model[relation.property] = map.get(model[relation.primaryKey])

      return model
    })
  }

  /**
   * Apply a where has relation to the query when the given model
   * has one of the relation.
   */
  public static whereHas(
    Model: typeof BaseModel,
    query: Driver,
    relation: HasOneOptions
  ) {
    const RelationModel = relation.model()

    const primaryKey = Model.schema().getMainPrimaryKeyName()
    const foreignKey =
      Model.schema().getColumnNameByProperty(relation.foreignKey) ||
      Model.schema().getColumnNameByProperty(
        `${String.toCamelCase(RelationModel.name)}Id`
      )

    query.table(RelationModel.table())

    RelationModel.query()
      .setQueryBuilder(query)
      .select()
      .whereRaw(
        `${RelationModel.table()}.${foreignKey} = ${Model.table()}.${primaryKey}`
      )
      .when(relation.closure, relation.closure)
  }
}
