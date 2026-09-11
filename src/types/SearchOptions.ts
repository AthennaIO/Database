/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type SearchOptions = {
  /**
   * Wrap both the column and the term in `unaccent()` so "João"
   * matches "Joao" and vice versa. Only Postgres supports it and
   * it REQUIRES the `unaccent` extension to be installed:
   *
   * ```sql
   * CREATE EXTENSION IF NOT EXISTS unaccent
   * ```
   *
   * MySQL, SQLite and Mongo ignore this option.
   *
   * @default false
   */
  unaccent?: boolean
}
