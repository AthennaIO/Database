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

    const modelSchema = Model.schema()

    return {
      query: new ModelQueryBuilder(RelationModel),
      primary: Model.primaryKey,
      foreign:
        modelSchema[relation.inverseSide].foreignKey ||
        `${model.constructor.name.toLowerCase()}Id`,
      property: relation.inverseSide,
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

    model[property] = await query
      .where({ [foreign]: model[primary] })
      .findMany()

    return model
  }
}
