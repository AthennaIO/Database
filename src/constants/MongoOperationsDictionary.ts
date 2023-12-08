/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Map the operations dictionary from an SQL Database
 * to MongoDB operators.
 */
export const MONGO_OPERATIONS_DICTIONARY = {
  '=': '$match',
  '>': '$gt',
  '>=': '$gte',
  '<': '$lt',
  '<=': '$lte',
  '<>': '$ne',
  like: '$regex',
  ilike: '$regex'
}
