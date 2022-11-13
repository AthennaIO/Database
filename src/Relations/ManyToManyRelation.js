/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Database, ModelQueryBuilder } from '#src/index'
import { String } from '@athenna/common'

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
      primary: relation.primaryKey || Model.primaryKey,
      foreign:
        relation.foreignKey || `${model.constructor.name.toLowerCase()}Id`,
      property: relation.name,
      pivotLocalPrimary: relation.pivotLocalPrimaryKey || Model.primaryKey,
      pivotLocalForeign:
        relation.pivotLocalForeignKey || `${String.singularize(Model.table)}Id`,
      pivotTable:
        relation.pivotTable || `${Model.table}_${RelationModel.table}`,
      pivotRelationPrimary:
        relation.pivotRelationPrimaryKey || RelationModel.primaryKey,
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
      pivotLocalPrimary,
      pivotRelationPrimary,
      pivotTable,
      pivotLocalForeign,
      pivotRelationForeign,
    } = this.getOptions(model, relation)

    /**
     * Using Database here because there is no PivotModel.
     */
    const pivotTableData = await Database.connection(connection)
      .table(pivotTable)
      .where(pivotLocalForeign, model[pivotLocalPrimary])
      .findMany()

    const relationIds = pivotTableData.map(d => d[pivotRelationForeign])

    /**
     * Execute client callback if it exists.
     */
    if (relation.callback) {
      await relation.callback(query)
    }

    model[property] = await query
      .whereIn(pivotRelationPrimary, relationIds)
      .findMany()

    /**
     * Get the pivot table array data and set
     * in the respective relation model.
     */
    model[property].forEach(
      m =>
        (m.pivot = pivotTableData.find(
          d => d[pivotRelationForeign] === m[pivotRelationPrimary],
        )),
    )

    return model
  }

  /**
   * Save all many-to-many relations of model.
   *
   * @param model {any}
   * @param relations {any}
   * @param relationSchema {any}
   * @return {Promise<any[]>}
   */
  static async saveAll(model, relations, relationSchema) {
    const Model = model.constructor
    const modelSchema = Model.schema()
    const RelationModel = relationSchema.model

    const localTable = Model.table
    const pivotLocalPrimary =
      relationSchema.pivotLocalPrimaryKey || Model.primaryKey
    const localForeign =
      modelSchema.pivotLocalForeignKey || `${Model.name.toLowerCase()}Id`

    const relationTable = RelationModel.table
    const pivotRelationPrimary =
      relationSchema.pivotRelationPrimaryKey || RelationModel.primaryKey
    const relationForeign =
      modelSchema.pivotRelationForeignKey ||
      `${RelationModel.name.toLowerCase()}Id`

    const pivotTable =
      relationSchema.pivotTable || `${localTable}_${relationTable}`

    const query = Database.connection(Model.connection).table(pivotTable)

    const promises = relations.map(relation => {
      const data = {
        [localForeign]: model[pivotLocalPrimary],
        [relationForeign]: relation[pivotRelationPrimary],
      }

      return query
        .where(data)
        .find()
        .then(exists => {
          if (exists) {
            return
          }

          const createdPromise = query.create(data)

          if (
            Model.connection === 'mysql' &&
            modelSchema[pivotLocalPrimary] !== 'increments'
          ) {
            return createdPromise.then(() => query.where(data).find())
          }

          return createdPromise
        })
    })

    return Promise.all(promises)
  }
}
