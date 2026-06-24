/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ConstraintViolationException } from '#src/exceptions/ConstraintViolationException'

export type NotNullViolationMeta = {
  table?: string
  column?: string
  driver?: string
  raw?: any
}

export class NotNullViolationException extends ConstraintViolationException {
  /**
   * The column that received a null value, when known.
   */
  public column?: string

  public constructor(meta: NotNullViolationMeta = {}) {
    const { table, column, driver, raw } = meta

    super({
      status: 422,
      code: 'E_NOT_NULL_VIOLATION',
      message: `Not-null constraint violated${
        column ? ` for column "${column}"` : ''
      }${table ? ` on table "${table}"` : ''}.`,
      help: `The column ${
        column ? `"${column}"` : ''
      } does not accept null values. Provide a value for it before persisting.`
    })

    this.table = table
    this.column = column
    this.driver = driver
    this.raw = raw
  }
}
