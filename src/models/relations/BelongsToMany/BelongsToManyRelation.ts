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
import { Database } from '#src/facades/Database'
import type { BelongsToManyOptions } from '#src/types'

export class BelongsToManyRelation {
  /**
   * Load a belongs to many relation.
   */
  public static async load(
    model: Model,
    relation: BelongsToManyOptions
  ): Promise<any> {
    const _Model = model.constructor as typeof Model
    const RelationModel = relation.model()
    const connection = _Model.connection()

    relation.pivotTable =
      relation.pivotTable || `${_Model.table()}_${RelationModel.table()}`
    relation.pivotPrimaryKey = RelationModel.schema().getMainPrimaryKeyName()
    relation.pivotForeignKey = `${String.toCamelCase(
      String.singularize(RelationModel.table())
    )}Id`

    /**
     * Using Database here because there is no PivotModel.
     */
    const pivotTableData = await Database.connection(connection)
      .table(relation.pivotTable)
      .where(relation.foreignKey, model[relation.primaryKey])
      .findMany()

    const relationIds = pivotTableData.map(d => d[relation.pivotForeignKey])

    model[relation.property] = await RelationModel.query()
      .whereIn(relation.pivotPrimaryKey as never, relationIds)
      .when(relation.closure, relation.closure)
      .findMany()

    /**
     * Get the pivot table array data and set
     * in the respective relation model.
     */
    model[relation.property].map(model => {
      model.pivot =
        pivotTableData.find(
          data =>
            data[relation.pivotForeignKey] === model[relation.pivotPrimaryKey]
        ) || {}

      return model
    })

    return model
  }

  /**
   * Load all models that belongs to relation.
   */
  public static async loadAll(
    models: Model[],
    relation: BelongsToManyOptions
  ): Promise<any[]> {
    // TODO Improve the code below

    const _Model = models[0].constructor as typeof Model
    const RelationModel = relation.model()
    const connection = _Model.connection()

    relation.pivotTable =
      relation.pivotTable || `${_Model.table()}_${RelationModel.table()}`
    relation.pivotPrimaryKey = RelationModel.schema().getMainPrimaryKeyName()
    relation.pivotForeignKey = `${String.toCamelCase(
      String.singularize(RelationModel.table())
    )}Id`

    const primaryKeys = models.map(m => m[relation.primaryKey])

    /**
     * Using Database here because there is no PivotModel.
     */
    const pivotTableData = await Database.connection(connection)
      .table(relation.pivotTable)
      .whereIn(relation.foreignKey, primaryKeys)
      .findMany()

    const pivotTableMap = new Map()
    const pivotForeignKeys = []

    pivotTableData.forEach(data => {
      pivotForeignKeys.push(data[relation.pivotForeignKey])

      const array = pivotTableMap.get(data[relation.foreignKey]) || []

      array.push(data[relation.pivotForeignKey])

      pivotTableMap.set(data[relation.foreignKey], array)
    })

    const results = await RelationModel.query()
      .whereIn(relation.pivotPrimaryKey as never, pivotForeignKeys)
      .when(relation.closure, relation.closure)
      .findMany()

    const map = new Map()

    results.forEach(result => {
      result.pivot =
        pivotTableData.find(
          data =>
            data[relation.pivotForeignKey] === result[relation.pivotPrimaryKey]
        ) || {}

      map.set(result[relation.pivotPrimaryKey], result)
    })

    return models.map(model => {
      const ids = pivotTableMap.get(model[relation.primaryKey]) || []

      model[relation.property] = ids.map(id => map.get(id))

      return model
    })
  }
}
