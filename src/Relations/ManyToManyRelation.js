/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Database, ModelQueryBuilder } from '#src/index'

export class ManyToManyRelation {
  /**
   * Load a many-to-many relation.
   *
   * @param model {any}
   * @param relation {any}
   * @return {Promise<any>}
   */
  async load(model, relation) {
    const propertyName = relation.propertyName
    const pivotTableName = relation.pivotTableName
    const relationPrimaryKey = relation.relationPrimaryKey
    const pivotRelationForeignKey = relation.pivotRelationForeignKey
    const localPrimaryKey = relation.localPrimaryKey
    const pivotLocalForeignKey = relation.pivotLocalForeignKey
    const query = new ModelQueryBuilder(relation.model)

    /**
     * Using Database here because there is no PivotModel.
     */
    const pivotTableData = await Database.buildTable(pivotTableName)
      .buildWhere({
        [pivotLocalForeignKey]: model[localPrimaryKey],
      })
      .findMany()

    model.$extras = pivotTableData

    const relationIds = pivotTableData.map(d => d[pivotRelationForeignKey])

    /**
     * Execute client callback if it exists.
     */
    if (relation.callback) {
      await relation.callback(query)
    }

    model[propertyName] = await query
      .whereIn(relationPrimaryKey, relationIds)
      .findMany()

    return model
  }
}
