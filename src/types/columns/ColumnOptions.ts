/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ColumnType } from '#src/types/columns/ColumnType'

export type ColumnOptions = {
  /**
   * The property name in class of the column.
   *
   * @readonly
   * @default key
   */
  property?: string

  /**
   * The column name in database. The default
   * value of this property will be the name
   * of the class property as camelCase.
   *
   * @default String.toCamelCase(key)
   */
  name?: string

  /**
   * The column type in database. This value
   * only matters when you are using MongoDB
   * or when you want to synchronize you model
   * with database FOR DEVELOPMENT purposes only.
   *
   * @default undefined
   */
  type?: ColumnType

  /**
   * The column length in database. This value only
   * matters when you a want to synchronize your
   * model with database FOR DEVELOPMENT purposes only.
   *
   * @default undefined
   */
  length?: number

  /**
   * Set the default value for the column before
   * running your model `create()`, `createMany()`,
   * `update()` and `createOrUpdate()` methods.
   *
   * This property doesn't change the behavior in
   * your database, but only while running the above
   * methods.
   *
   * @default null
   */
  defaultTo?: any

  /**
   * Set if the column is a primary key.
   *
   * @default false
   */
  isPrimary?: boolean

  /**
   * Set if the field should be hidden when
   * retrieving it from database.
   *
   * @default false
   */
  isHidden?: boolean

  /**
   * Set if the column is unique in database.
   *
   * @default false
   */
  isUnique?: boolean

  /**
   * Set if the column is nullable in database.
   *
   * @default true
   */
  isNullable?: boolean

  /**
   * Set if the column is an index in database.
   *
   * @default false
   */
  isIndex?: boolean

  /**
   * Set if the column is sparse in database.
   *
   * @default false
   */
  isSparse?: boolean

  /**
   * Set if the column should be persisted in database
   * when executing operation like create or update.
   *
   * If set as `false`, Athenna will remove this column
   * from this kind of operation, but it will still be
   * available in operations like `find` and `findMany`.
   *
   * To also remove from listing operations, set isHidden
   * as `true`.
   *
   * @default true
   */
  persist?: boolean

  /**
   * Set if this column is the main primary key that
   * should be used when performing create queries to
   * database.
   *
   * Your class can only have one column option with
   * isMainPrimary set as true. If you set isMainPrimary
   * as true, Athenna will set isPrimary as true by default.
   *
   * @default false
   */
  isMainPrimary?: boolean

  /**
   * Set if the column is createdAt field.
   * Columns with `isCreateDate` as `true`
   * will automatically be set with `new Date()`
   * value when creating your model.
   *
   * The `new Date()` value will only be set
   * when your column doesn't have `defaultTo`
   * value set and also when the field is not
   * present when calling any method that creates
   * the model in database like `create()`.
   *
   * @default false
   */
  isCreateDate?: boolean

  /**
   * Set if the column is updatedAt field.
   * Columns with `isUpdateDate` as `true`
   * will automatically be set with `new Date()`
   * value when updating your model.
   *
   * The `new Date()` value will only be set
   * when your column doesn't have `defaultTo`
   * value set and also when the field is not
   * present when calling any method that updates
   * the model in database like `update()`.
   *
   * @default false
   */
  isUpdateDate?: boolean

  /**
   * Set if the column is deletedAt field.
   * By default, if you define add field with
   * `isDeleteDate` as `true`, it will automatically
   * turn on soft delete for your model, this means
   * that if this column is not null, it will be
   * considered a deleted value, not being retrieved
   * when calling methods like `find()`.
   *
   * It will also automatically set `new Date()`
   * value to the column when deleting your model.
   *
   * The `new Date()` value will only be set
   * when your column doesn't have `defaultTo`
   * value set and also when the field is not
   * present when calling `delete()` method.
   *
   * @default false
   */
  isDeleteDate?: boolean
}
