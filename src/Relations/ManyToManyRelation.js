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

    return {
      query: new ModelQueryBuilder(RelationModel),
      connection: Model.connection,
      primary: Model.primaryKey,
      foreign:
        relation.foreignKey || `${model.constructor.name.toLowerCase()}Id`,
      property: relation.name,
      localPrimary: Model.primaryKey,
      pivotLocalForeign:
        relation.pivotLocalForeignKey || `${String.singularize(Model.table)}Id`,
      pivotTable:
        relation.pivotTable || `${Model.table}_${RelationModel.table}`,
      relationPrimary: RelationModel.primaryKey,
      pivotRelationForeign:
        relation.pivotRelationForeignKey ||
        `${String.singularize(RelationModel.table)}Id`,
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
      connection,
      property,
      localPrimary,
      relationPrimary,
      pivotTable,
      pivotLocalForeign,
      pivotRelationForeign,
    } = this.getOptions(model, relation)

    /**
     * Using Database here because there is no PivotModel.
     */
    const pivotTableData = await Database.connection(connection)
      .table(pivotTable)
      .where(pivotLocalForeign, model[localPrimary])
      .findMany()

    model.$extras = pivotTableData

    const relationIds = pivotTableData.map(d => d[pivotRelationForeign])

    /**
     * Execute client callback if it exists.
     */
    if (relation.callback) {
      await relation.callback(query)
    }

    model[property] = await query
      .whereIn(relationPrimary, relationIds)
      .findMany()

    return model
  }

  /**
   * Save all many to many relations of model.
   *
   * @param model {any}
   * @param relations {any}
   * @param RelationModel {any}
   * @return {Promise<any[]>}
   */
  static async saveAll(model, relations, RelationModel) {
    const Model = model.constructor

    const localTable = Model.table
    const localPrimary = Model.primaryKey
    const localForeign = `${Model.name.toLowerCase()}Id`

    const relationTable = RelationModel.table
    const relationPrimary = RelationModel.primaryKey
    const relationForeign = `${RelationModel.name.toLowerCase()}Id`

    const query = Database.connection(Model.connection).table(
      `${localTable}_${relationTable}`,
    )

    await query
      .whereIn(
        relationForeign,
        relations.map(r => r[relationPrimary]),
      )
      .delete()

    const promises = relations.map(relation => {
      return Database.connection(Model.connection)
        .table(`${localTable}_${relationTable}`)
        .create({
          [localForeign]: model[localPrimary],
          [relationForeign]: relation[relationPrimary],
        })
    })

    return Promise.all(promises)
  }
}
