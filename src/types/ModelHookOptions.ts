/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * All the model lifecycle hook types that can be registered
 * with the `@Before...()` and `@After...()` annotations.
 */
export type ModelHookType =
  | 'beforeCreate'
  | 'afterCreate'
  | 'beforeUpdate'
  | 'afterUpdate'
  | 'beforeSave'
  | 'afterSave'
  | 'beforeDelete'
  | 'afterDelete'
  | 'beforeFind'
  | 'afterFind'

/**
 * The metadata registered for each model lifecycle hook.
 */
export interface ModelHookOptions {
  /**
   * The lifecycle moment when the hook method will be fired.
   */
  type: ModelHookType

  /**
   * The static model method that will be fired. The method is
   * always called with the model class as `this` and receives
   * a single payload argument that changes per operation:
   *
   * - Instance operations (`model.save()`, `model.delete()`)
   *   receive the model instance.
   * - Query/static create and update operations receive the data
   *   object in before hooks and the resulting model instance in
   *   after hooks.
   * - `beforeFind` receives the model query builder.
   * - `afterFind` receives each model instance retrieved.
   */
  method: (payload?: any) => any
}
