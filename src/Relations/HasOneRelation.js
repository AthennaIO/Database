/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ModelQueryBuilder } from '#src/index'

export class HasOneRelation {
  /**
   * Get the relation options to craft the has one query.
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
      primary: relation.primaryKey || Model.primaryKey,
      foreign: relation.foreignKey || `${relation.inverseSide}Id`,
      property: relation.name,
    }
  }

  /**
   * Load a has one relation.
   *
   * @param model {any}
   * @param relation {any}
   * @return {Promise<any>}
   */
  async load(model, relation) {
    const { query, primary, foreign, property } = this.getOptions(
      model,
      relation,
    )

    /**
     * Execute client callback if it exists.
     */
    if (relation.callback) {
      await relation.callback(query)
    }

    model[property] = await query.where({ [foreign]: model[primary] }).find()

    return model
  }

  /**
   * Load all models that has one relation.
   *
   * @param models {any[]}
   * @param relation {any}
   * @return {Promise<any>}
   */
  async loadAll(models, relation) {
    const { query, primary, foreign, property } = this.getOptions(
      models[0],
      relation,
    )

    /**
     * Execute client callback if it exists.
     */
    if (relation.callback) {
      await relation.callback(query)
    }

    const primaryValues = models.map(model => model[primary])
    const results = await query.whereIn(foreign, primaryValues).findMany()

    const map = new Map()
    results.forEach(result => map.set(result[foreign], result))

    return models.map(
      model => (model[property] = map.get(model[primary]) || {}),
    )
  }
}
