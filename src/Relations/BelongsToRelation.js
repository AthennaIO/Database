/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ModelQueryBuilder } from '#src/index'

export class BelongsToRelation {
  /**
   * Get the relation options to craft the belongs to query.
   *
   * @param relation {any}
   * @return {{query: ModelQueryBuilder, property: string, primary: string, foreign: string}}
   */
  static getOptions(relation) {
    const RelationModel = relation.model

    return {
      query: new ModelQueryBuilder(RelationModel),
      primary: relation.primaryKey || RelationModel.primaryKey,
      foreign: relation.foreignKey || `${relation.name}Id`,
      property: relation.name,
    }
  }

  /**
   * Create a new query builder for a belongs to relation.
   *
   * @param model {import('#src/index').Model}
   * @param RelationModel {typeof import('#src/index').Model}
   * @param [withCriterias] {boolean}
   * @return {ModelQueryBuilder}
   */
  static getQueryBuilder(model, RelationModel, withCriterias) {
    const Model = model.constructor
    const relation = Model.getSchema().getRelationByModel(RelationModel)

    const { primary, foreign } = this.getOptions(relation)

    return new ModelQueryBuilder(RelationModel, withCriterias).where(
      primary,
      model[foreign],
    )
  }

  /**
   * Load a belongs to relation.
   *
   * @param model {any}
   * @param relation {any}
   * @return {Promise<any>}
   */
  static async load(model, relation) {
    const { query, primary, foreign, property } = this.getOptions(relation)

    /**
     * Execute client callback if it exists.
     */
    if (relation.callback) {
      await relation.callback(query)
    }

    model[property] = await query.where(primary, model[foreign]).find()

    return model
  }

  /**
   * Load all models that belongs to relation.
   *
   * @param models {any[]}
   * @param relation {any}
   * @return {Promise<any>}
   */
  static async loadAll(models, relation) {
    const { query, primary, foreign, property } = this.getOptions(relation)

    /**
     * Execute client callback if it exists.
     */
    if (relation.callback) {
      await relation.callback(query)
    }

    const foreignValues = models.map(model => model[foreign])
    const results = await query.whereIn(primary, foreignValues).findMany()

    const map = new Map()
    results.forEach(result => map.set(result[primary], result))

    return models.map(
      model => (model[property] = map.get(model[foreign]) || {}),
    )
  }
}
