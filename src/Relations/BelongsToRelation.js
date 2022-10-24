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
  getOptions(relation) {
    const RelationModel = relation.model

    return {
      query: new ModelQueryBuilder(RelationModel),
      primary: RelationModel.primaryKey,
      foreign: relation.foreignKey || `${relation.name}Id`,
      property: relation.name,
    }
  }

  /**
   * Load a belongs to relation.
   *
   * @param model {any}
   * @param relation {any}
   * @return {Promise<any>}
   */
  async load(model, relation) {
    const { query, primary, foreign, property } = this.getOptions(relation)

    /**
     * Execute client callback if it exists.
     */
    if (relation.callback) {
      await relation.callback(query)
    }

    model[property] = await query.where({ [primary]: model[foreign] }).find()

    return model
  }
}
