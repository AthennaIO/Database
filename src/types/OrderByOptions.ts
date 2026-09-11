/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type OrderByOptions = {
  /**
   * Where the `NULL` values should be placed. Postgres and SQLite
   * use `NULLS FIRST/LAST`, MySQL emulates it with an `IS NULL`
   * sort key. Mongo ignores this option and always sorts nulls
   * first in `ASC` and last in `DESC`.
   */
  nulls?: 'first' | 'last'
}
