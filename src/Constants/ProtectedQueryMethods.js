/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * All Knex methods that are protected by drivers that
 * are dependent of Knex query builder. Every time that
 * one of these methods are called, a new instance of query
 * builder is created inside the Driver using Proxies.
 *
 * @type {string[]}
 */
export const PROTECTED_QUERY_METHODS = [
  'pluck',
  'insert',
  'update',
  'delete',
  'first',
  'min',
  'max',
  'sum',
  'sumDistinct',
  'avg',
  'avgDistinct',
  'count',
  'countDistinct',
  'increment',
  'decrement',
]
