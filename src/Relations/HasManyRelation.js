/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ModelQueryBuilder } from '#src/index'

export class HasManyRelation {
  /**
   * Get the relation options to craft the has many query.
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
   * Load a has many relation.
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

    model[property] = await query.where(foreign, model[primary]).findMany()

    return model
  }

  /**
   * Load all models that has many relation.
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
    results.forEach(result => {
      if (!map.has(result[foreign])) {
        map.set(result[foreign], [result])

        return
      }

      const array = map.get(result[foreign])

      array.push(result)

      map.set(result[foreign], array)
    })

    return models.map(
      model => (model[property] = map.get(model[primary]) || []),
    )
  }
}
