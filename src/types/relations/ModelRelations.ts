/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { BaseModel } from '#src/models/BaseModel'

export type RelationKeys<T> = {
  [K in keyof T]: T[K] extends BaseModel | BaseModel[] ? K : never
}[keyof T]

export type ModelRelations<T> = Extract<RelationKeys<T>, string>
