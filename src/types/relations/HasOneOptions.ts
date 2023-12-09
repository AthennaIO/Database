/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ModelColumns } from '#src/types'
import type { BaseModel } from '#src/models/BaseModel'
import type { ModelQueryBuilder } from '#src/models/builders/ModelQueryBuilder'

export type HasOneOptions<
  T extends BaseModel = any,
  R extends BaseModel = any
> = {
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
  model?: () => typeof BaseModel

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
  primaryKey?: ModelColumns<T>

  /**
   * The foreign key is the camelCase representation
   * of the main model name with an 'Id' at the end.
   *
   * @default `${String.toCamelCase(Model.name)}Id`
   */
  foreignKey?: ModelColumns<R>
}
