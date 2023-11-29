/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Model } from '#src/models/Model'
import type { ModelQueryBuilder } from 'src/models/builders/ModelQueryBuilder.js'

export type HasOneOptions = {
  /**
   * The relation option type.
   *
   * @readonly
   * @default 'hasOne'
   */
  type?: 'hasOne'

  /**
   * The closure that should be executed while
   * querying the relation data from database.
   *
   * @default undefined
   */
  closure?: (query: ModelQueryBuilder) => any

  /**
   * The property name in class of the relation.
   *
   * @readonly
   * @default key
   */
  property?: string

  /**
   * The relation model that is being referenced.
   *
   * @readonly
   */
  model?: () => typeof Model

  /**
   * Set if the model will be included when fetching
   * data.
   * If this option is true, you don't need to call
   * methods like `with()` to eager load your relation.
   *
   * @default false
   */
  isIncluded?: boolean

  /**
   * The primary key is always the primary key
   * of the main model.
   *
   * @default Model.schema().getMainPrimaryKey()
   */
  primaryKey?: string

  /**
   * The foreign key is the camelCase representation
   * of the relation model name with an 'Id' at the end.
   *
   * @default `${String.toCamelCase(RelationModel.name)}Id`
   */
  foreignKey?: string
}
