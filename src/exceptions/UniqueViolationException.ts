/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ConstraintViolationException } from '#src/exceptions/ConstraintViolationException'

export type UniqueViolationMeta = {
  table?: string
  columns?: string[]
  constraint?: string
  driver?: string
  raw?: any
}

export class UniqueViolationException extends ConstraintViolationException {
  /**
   * The column(s) that make up the violated unique key, when known.
   */
  public columns?: string[]

  /**
   * The name of the violated unique constraint/index, when known.
   */
  public constraint?: string

  public constructor(meta: UniqueViolationMeta = {}) {
    const { table, columns, constraint, driver, raw } = meta
    const cols = columns?.length ? columns.join(', ') : null

    super({
      status: 409,
      code: 'E_UNIQUE_VIOLATION',
      message: `Unique constraint${
        constraint ? ` "${constraint}"` : ''
      } violated${table ? ` on table "${table}"` : ''}${
        cols ? ` for column(s) [${cols}]` : ''
      }.`,
      help: `A record with the same ${
        cols ?? 'unique value'
      } already exists. Use createOrIgnore()/createOrFirst() to handle the conflict gracefully, or persist a different value.`
    })

    this.table = table
    this.columns = columns
    this.constraint = constraint
    this.driver = driver
    this.raw = raw
  }
}
