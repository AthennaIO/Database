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

export type HasManyThroughOptions<
  T extends BaseModel = any,
  R extends BaseModel = any,
  H extends BaseModel = any
> = {
  /**
   * The relation option type.
   *
   * @readonly
   * @default 'hasManyThrough'
   */
  type?: 'hasManyThrough'

  /**
   * The closure that should be executed while
   * querying the relation data from database.
   *
   * Used by `whereHas()` for the WHERE EXISTS subquery.
   *
   * @default undefined
   */
  closure?: (query: ModelQueryBuilder<R>) => any

  /**
   * The closure provided to `with()` for eager loading.
   * Kept separate from {@link closure} so that a `whereHas()` call
   * on the same relation never overwrites the eager-load filter.
   *
   * @default undefined
   */
  withClosure?: (query: ModelQueryBuilder<R>) => any

  /**
   * The property name in class of the relation.
   *
   * @readonly
   * @default key
   */
  property?: string

  /**
   * The final relation model that is being referenced
   * through the intermediate model.
   *
   * @readonly
   */
  model?: () => typeof BaseModel

  /**
   * The intermediate model used to traverse from the
   * parent model to the final relation model.
   *
   * @readonly
   */
  through?: () => typeof BaseModel

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
   * Internal flag when `whereHas()` applies a constraint on this relation.
   * Does not eager-load; use {@link isIncluded} / `with()` to load related rows.
   *
   * @default false
   */
  isWhereHasIncluded?: boolean

  /**
   * The column on the parent model that links to the
   * intermediate model via {@link firstKey}.
   *
   * @default Model.schema().getMainPrimaryKeyProperty()
   */
  localKey?: ModelColumns<T>

  /**
   * The column on the intermediate model that points
   * back at the parent model.
   *
   * @default `${String.toCamelCase(Model.name)}Id`
   */
  firstKey?: ModelColumns<H>

  /**
   * The column on the intermediate model that participates
   * in the link to the final model.
   *
   * - Shape A (default): `Through.schema().getMainPrimaryKeyProperty()`
   * - Shape B (`inverse: true`): `${String.toCamelCase(Final.name)}Id`
   */
  secondLocalKey?: ModelColumns<H>

  /**
   * The column on the final model that participates
   * in the link to the intermediate model.
   *
   * - Shape A (default): `${String.toCamelCase(Through.name)}Id`
   * - Shape B (`inverse: true`): `Final.schema().getMainPrimaryKeyProperty()`
   */
  secondKey?: ModelColumns<R>

  /**
   * Flip the defaults so the foreign key linking the
   * intermediate model to the final model lives on the
   * intermediate model (shape B).
   *
   * @default false
   */
  inverse?: boolean
}
