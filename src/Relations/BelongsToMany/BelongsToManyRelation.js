/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { String } from '@athenna/common'
import { Database, ModelQueryBuilder } from '#src/index'
import { BelongsToManyQueryBuilder } from '#src/Relations/BelongsToMany/BelongsToManyQueryBuilder'

export class BelongsToManyRelation {
  /**
   * Get the relation options to craft the many-to-many query.
   *
   * @param model {any}
   * @param relation {any}
   * @return {{query: ModelQueryBuilder, property: string, primary: string, foreign: string}}
   */
  static getOptions(model, relation) {
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
   * Create a new query builder for a many-to-many relation.
   *
   * @param model {import('#src/index').Model}
   * @param RelationModel {typeof import('#src/index').Model}
   * @param [withCriterias] {boolean}
   * @return {import('#src/index').BelongsToManyQueryBuilder}
   */
  static getQueryBuilder(model, RelationModel, withCriterias) {
    const Model = model.constructor
    const relation = Model.getSchema().getRelationByModel(RelationModel)

    return new BelongsToManyQueryBuilder(
      model,
      RelationModel,
      withCriterias,
      this.getOptions(model, relation),
    )
  }

  /**
   * Load a many-to-many relation.
   *
   * @param model {any}
   * @param relation {any}
   * @return {Promise<any>}
   */
  static async load(model, relation) {
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
   * Load all models that has many-to-many relation.
   *
   * @param models {any[]}
   * @param relation {any}
   * @return {Promise<any>}
   */
  static async loadAll(models, relation) {
    const {
      query,
      connection,
      property,
      pivotLocalPrimary,
      pivotRelationPrimary,
      pivotTable,
      pivotLocalForeign,
      pivotRelationForeign,
    } = this.getOptions(models[0], relation)

    const pivotLocalPrimaryValues = models.map(
      model => model[pivotLocalPrimary],
    )

    /**
     * Using Database here because there is no PivotModel.
     */
    const pivotTableData = await Database.connection(connection)
      .table(pivotTable)
      .whereIn(pivotLocalForeign, pivotLocalPrimaryValues)
      .findMany()

    const foreignIds = pivotTableData.map(d => d[pivotRelationForeign])

    /**
     * Execute client callback if it exists.
     */
    if (relation.callback) {
      await relation.callback(query)
    }

    const results = await query
      .whereIn(pivotRelationPrimary, foreignIds)
      .findMany()

    const map = new Map()
    results.forEach(result => map.set(result[pivotRelationPrimary], result))

    return models.map(model => {
      model[property] = map.get(model[pivotRelationForeign]) || []

      /**
       * Get the pivot table array data and set
       * in the respective relation model.
       */
      model.pivot =
        pivotTableData.find(
          d => d[pivotRelationForeign] === model[pivotRelationPrimary],
        ) || {}

      return model
    })
  }

  /**
   * Save all many-to-many relations of model.
   *
   * @param model {any}
   * @param relations {any}
   * @param relationSchema {any}
   * @return {Promise<any[]>}
   */
  static async save(model, relations, relationSchema) {
    const {
      connection,
      pivotLocalPrimary,
      pivotRelationPrimary,
      pivotTable,
      pivotLocalForeign,
      pivotRelationForeign,
    } = this.getOptions(model, relationSchema)

    const query = Database.connection(connection).table(pivotTable)

    const promises = relations.map(relation => {
      const data = {
        [pivotLocalForeign]: model[pivotLocalPrimary],
        [pivotRelationForeign]: relation[pivotRelationPrimary],
      }

      return query
        .where(data)
        .find()
        .then(exists => {
          if (exists) {
            return
          }

          const createdPromise = query.create(data)

          if (connection === 'mysql' && pivotLocalPrimary !== 'increments') {
            return createdPromise.then(() => query.where(data).find())
          }

          return createdPromise
        })
    })

    const pivotTableData = await Promise.all(promises)

    /**
     * Get the pivot table array data and set
     * in the respective relation model.
     */
    relations.forEach(relation => {
      const statement = data =>
        data[relationSchema.pivotRelationForeign] ===
        relation[relationSchema.pivotRelationPrimary]

      relation.pivot = pivotTableData.find(statement)
    })
  }
}