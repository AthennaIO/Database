/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { BaseModel } from '#src/models/BaseModel'

export type ColumnKeys<T> = {
  [K in keyof T]: T[K] extends BaseModel | BaseModel[] ? never : K
}[keyof Omit<
  T,
  | 'save'
  | 'fresh'
  | 'refresh'
  | 'dirty'
  | 'delete'
  | 'restore'
  | 'isDirty'
  | 'isTrashed'
  | 'isPersisted'
  | 'setOriginal'
  | 'load'
  | 'toJSON'
>]

export type ModelColumns<T> = Extract<ColumnKeys<T>, string>
