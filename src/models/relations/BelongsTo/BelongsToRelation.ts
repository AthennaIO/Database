/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { String } from '@athenna/common'
import type { BelongsToOptions } from '#src/types'
import type { BaseModel } from '#src/models/BaseModel'
import type { Driver } from '#src/database/drivers/Driver'

export class BelongsToRelation {
  /**
   * Get the options with defined default values.
   */
  private static options(relation: BelongsToOptions): BelongsToOptions {
    const RelationModel = relation.model()

    relation.primaryKey =
      relation.primaryKey || RelationModel.schema().getMainPrimaryKeyProperty()
    relation.foreignKey =
      relation.foreignKey || `${String.toCamelCase(RelationModel.name)}Id`

    return relation
  }

  /**
   * Load a belongs to relation.
   */
  public static async load(
    model: BaseModel,
    relation: BelongsToOptions
  ): Promise<any> {
    this.options(relation)

    model[relation.property] = await relation
      .model()
      .query()
      .where(relation.primaryKey as never, model[relation.foreignKey])
      .when(relation.closure, relation.closure)
      .find()

    return model
  }

  /**
   * Load all models that belongs to relation.
   */
  public static async loadAll(
    models: BaseModel[],
    relation: BelongsToOptions
  ): Promise<any[]> {
    this.options(relation)

    const foreignValues = models.map(model => model[relation.foreignKey])
    const results = await relation
      .model()
      .query()
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

  /**
   * Apply a where has relation to the query when the relation
   * is a belongs to the given model.
   */
  public static whereHas(
    Model: typeof BaseModel,
    query: Driver,
    relation: BelongsToOptions
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
        `${Model.table()}.${foreignKey} = ${RelationModel.table()}.${primaryKey}`
      )
      .when(relation.closure, relation.closure)
  }
}
