/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Model } from '#src/models/Model'

export type ColumnKeys<T> = {
  [K in keyof T]: T[K] extends Model | Model[] ? never : K
}[keyof Omit<T, 'save' | 'load' | 'original' | 'toJSON'>]

export type ModelColumns<T> = Extract<ColumnKeys<T>, string>
