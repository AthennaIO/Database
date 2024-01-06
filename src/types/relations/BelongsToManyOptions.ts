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

export type BelongsToManyOptions<
  T extends BaseModel = any,
  R extends BaseModel = any,
  P extends BaseModel = any
> = {
  /**
   * The relation option type.
   *
   * @readonly
   * @default 'belongsToMany'
   */
  type?: 'belongsToMany'

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
   * The pivot model that will be used to save the
   * relations between main model and relation model.
   *
   * @readonly
   */
  pivotModel?: () => typeof BaseModel

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
   * The foreign key is the camelCase in singular
   * representation of the main model table name with
   * 'Id' in the end. The foreign key will always
   * be defined inside the pivot model.
   *
   * @default `${String.toCamelCase(Model.name)}Id`
   */
  foreignKey?: ModelColumns<P>

  /**
   * The pivot table is always the merge of main model
   * table name with relation model table name.
   *
   * @default PivotModel.table()
   */
  pivotTable?: string

  /**
   * The relation primary key is always the primary key
   * of the relation model.
   *
   * @default Relation.schema().getMainPrimaryKeyName()
   */
  relationPrimaryKey?: ModelColumns<R>

  /**
   * The relation foreign key is the camelCase in singular
   * representation of the relation model name with
   * an 'Id' at the end. The relation foreign key will always
   * be defined inside the pivot model.
   *
   * @default `${String.toCamelCase(Relation.name)}Id`
   */
  relationForeignKey?: ModelColumns<P>
}
