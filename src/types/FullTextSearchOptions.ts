/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type FullTextSearchOptions = {
  /**
   * How the search term should be interpreted.
   *
   * - `natural`: every word in the term must be present, operators
   *   are ignored. Postgres uses `plainto_tsquery` and MySQL uses
   *   `IN NATURAL LANGUAGE MODE`.
   * - `boolean`: the term may contain operators such as quoted
   *   phrases, `-word` to exclude and `OR`. Postgres uses
   *   `websearch_to_tsquery` and MySQL uses `IN BOOLEAN MODE`.
   *
   * SQLite and Mongo ignore this option.
   *
   * @default 'natural'
   */
  mode?: 'natural' | 'boolean'

  /**
   * The language used to tokenize and stem the term. In Postgres
   * this is the text search configuration (e.g. `simple`, `english`,
   * `portuguese`) and it MUST match the configuration used to build
   * your GIN index, otherwise the index will not be used. In Mongo
   * it is forwarded as `$language`.
   *
   * MySQL and SQLite ignore this option.
   *
   * @default 'simple'
   */
  language?: string
}
