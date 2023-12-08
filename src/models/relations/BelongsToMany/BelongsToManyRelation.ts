/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { String } from '@athenna/common'
import type { BaseModel } from '#src/models/BaseModel'
import type { BelongsToManyOptions } from '#src/types'

export class BelongsToManyRelation {
  /**
   * Get the options with defined default values.
   */
  private static options(relation: BelongsToManyOptions): BelongsToManyOptions {
    const RelationModel = relation.model()
    const PivotModel = relation.pivotModel()

    relation.pivotTable = relation.pivotTable || PivotModel.table()
    relation.pivotPrimaryKey = RelationModel.schema().getMainPrimaryKeyName()
    relation.pivotForeignKey = `${String.toCamelCase(RelationModel.name)}Id`

    return relation
  }

  /**
   * Load a belongs to many relation.
   */
  public static async load(
    model: BaseModel,
    relation: BelongsToManyOptions
  ): Promise<any> {
    this.options(relation)

    const pivotData = await relation
      .pivotModel()
      .query()
      .where(relation.foreignKey as never, model[relation.primaryKey])
      .findMany()

    const relationIds = pivotData.map(d => d[relation.pivotForeignKey])

    model[relation.property] = await relation
      .model()
      .query()
      .whereIn(relation.pivotPrimaryKey as never, relationIds)
      .when(relation.closure, relation.closure)
      .findMany()

    return model
  }

  /**
   * Load all models that belongs to relation.
   */
  public static async loadAll(
    models: BaseModel[],
    relation: BelongsToManyOptions
  ): Promise<any[]> {
    this.options(relation)

    const primaryKeys = models.map(m => m[relation.primaryKey])
    const pivotData = await relation
      .pivotModel()
      .query()
      .whereIn(relation.foreignKey as never, primaryKeys)
      .findMany()

    const pivotDataMap = new Map()
    const pivotForeignKeys = []

    pivotData.forEach(data => {
      pivotForeignKeys.push(data[relation.pivotForeignKey])

      const array = pivotDataMap.get(data[relation.foreignKey]) || []

      array.push(data[relation.pivotForeignKey])

      pivotDataMap.set(data[relation.foreignKey], array)
    })

    const results = await relation
      .model()
      .query()
      .whereIn(relation.pivotPrimaryKey as never, pivotForeignKeys)
      .when(relation.closure, relation.closure)
      .findMany()

    const map = new Map()

    results.forEach(result => map.set(result[relation.pivotPrimaryKey], result))

    return models.map(model => {
      const ids = pivotDataMap.get(model[relation.primaryKey]) || []

      model[relation.property] = ids.map(id => map.get(id))

      return model
    })
  }
}
