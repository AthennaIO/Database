/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is } from '@athenna/common'

export type JsonOperationType = 'merge' | 'increment'

/**
 * A marker placed as the value of a JSON column in `update()` to
 * ask the driver to run an atomic operation on the column instead
 * of replacing it. Create instances with `Database.jsonMerge()`
 * and `Database.jsonIncrement()`.
 */
export class JsonOperation {
  /**
   * The operation to run.
   */
  public type: JsonOperationType

  /**
   * The path inside the column, relative to it. Only used by
   * `increment`, e.g. `['stats', 'count']` for `metadata->stats->count`.
   */
  public path: string[]

  /**
   * The object to merge or the amount to increment.
   */
  public value: any

  public constructor(type: JsonOperationType, path: string[], value: any) {
    this.type = type
    this.path = path
    this.value = value
  }

  /**
   * Shallow merge `object` into the column: first level keys
   * replace the existing ones and everything else is kept. A
   * `NULL` column is treated as `{}`.
   */
  public static merge(object: Record<string, any>) {
    return new JsonOperation('merge', [], object)
  }

  /**
   * Increment the number at `path` by `by`. A missing key or a
   * `NULL` column counts as `0`. The path is relative to the
   * column and uses the same `->` selector of `whereJson()`.
   */
  public static increment(path: string, by = 1) {
    return new JsonOperation('increment', JsonOperation.parsePath(path), by)
  }

  /**
   * Check if a value is a `JsonOperation`.
   */
  public static is(value: any): value is JsonOperation {
    return value instanceof JsonOperation
  }

  /**
   * Split a `column->a->b` selector into the column and the path,
   * or `null` when the value is not a selector.
   */
  public static parseSelector(
    selector: string
  ): { column: string; path: string } | null {
    if (!Is.String(selector) || !selector.includes('->')) {
      return null
    }

    const [column, ...parts] = selector.split('->')
    const path = parts.join('->').trim()

    if (!column?.trim() || !path) {
      return null
    }

    return { column: column.trim(), path }
  }

  /**
   * Split a `a->b->c` path into `['a', 'b', 'c']`.
   */
  public static parsePath(path: string) {
    return path
      .split('->')
      .map(part => part.trim())
      .filter(Boolean)
  }
}
