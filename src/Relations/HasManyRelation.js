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
   * Load a has many relation.
   *
   * @param model {any}
   * @param relation {any}
   * @return {Promise<any>}
   */
  async load(model, relation) {
    const primaryKey = relation.primaryKey
    const foreignKey = relation.foreignKey
    const propertyName = relation.propertyName
    const query = new ModelQueryBuilder(relation.model)

    /**
     * Execute client callback if it exists.
     */
    if (relation.callback) {
      await relation.callback(query)
    }

    model[propertyName] = await query
      .where({ [foreignKey]: model[primaryKey] })
      .findMany()

    return model
  }
}
