/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Model } from '#src/models/Model'
import type { ModelColumns } from '#src/types'
import type { ModelQueryBuilder } from 'src/models/builders/ModelQueryBuilder.js'

export type BelongsToOptions<T extends Model = any, R extends Model = any> = {
  /**
   * The relation option type.
   *
   * @readonly
   * @default 'belongsTo'
   */
  type?: 'belongsTo'

  /**
   * The closure that should be executed while
   * querying the relation data from database.
   *
   * @default undefined
   */
  closure?: (query: ModelQueryBuilder<R>) => any

  /**
   * The property name in class of the relation.
   *
   * @readonly
   * @default key
   */
  property?: ModelColumns<T>

  /**
   * The relation model that is being referenced as
   * a closure to protect models definition from import
   * issues.
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
   * of the relation model.
   *
   * @default RelationModel.schema().getMainPrimaryKey()
   */
  primaryKey?: ModelColumns<R>

  /**
   * The foreign key is the camelCase representation
   * of the relation model name with an 'Id' at the end.
   * The foreign key needs to be defined in the main model.
   *
   * @default `${String.toCamelCase(RelationModel.name)}Id`
   */
  foreignKey?: ModelColumns<T>
}
