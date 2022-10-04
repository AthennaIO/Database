/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Database, ModelQueryBuilder } from '#src/index'
import { String } from '@secjs/utils'

export class ManyToManyRelation {
  /**
   * Get the relation options to craft the many to many query.
   *
   * @param model {any}
   * @param relation {any}
   * @return {{query: ModelQueryBuilder, property: string, primary: string, foreign: string}}
   */
  getOptions(model, relation) {
    const Model = model.constructor
    const RelationModel = relation.model

    const modelSchema = Model.schema()

    const singularLocalTable = String.singularize(Model.table)
    const singularRelationTable = String.singularize(RelationModel.table)

    return {
      query: new ModelQueryBuilder(RelationModel),
      primary: Model.primaryKey,
      foreign:
        modelSchema[relation.inverseSide].foreignKey ||
        `${model.constructor.name.toLowerCase()}Id`,
      property: relation.inverseSide,
      localPrimary: Model.primaryKey,
      pivotLocalPrimary: `${singularLocalTable}Id`,
      pivotTable: `${singularLocalTable}_${singularRelationTable}`,
      relationPrimary: RelationModel.primaryKey,
      pivotRelationForeign: `${singularRelationTable}Id`,
    }
  }

  /**
   * Load a many-to-many relation.
   *
   * @param model {any}
   * @param relation {any}
   * @return {Promise<any>}
   */
  async load(model, relation) {
    const {
      query,
      propertyName,
      localPrimary,
      relationPrimary,
      pivotTable,
      pivotLocalForeign,
      pivotRelationForeign,
    } = this.getOptions(model, relation)

    /**
     * Using Database here because there is no PivotModel.
     */
    const pivotTableData = await Database.table(pivotTable)
      .where({
        [pivotLocalForeign]: model[localPrimary],
      })
      .findMany()

    model.$extras = pivotTableData

    const relationIds = pivotTableData.map(d => d[pivotRelationForeign])

    /**
     * Execute client callback if it exists.
     */
    if (relation.callback) {
      await relation.callback(query)
    }

    model[propertyName] = await query
      .whereIn(relationPrimary, relationIds)
      .findMany()

    return model
  }
}
