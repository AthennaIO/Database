/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ConstraintViolationException } from '#src/exceptions/ConstraintViolationException'

export type ForeignKeyViolationMeta = {
  table?: string
  column?: string
  constraint?: string
  driver?: string
  raw?: any
}

export class ForeignKeyViolationException extends ConstraintViolationException {
  /**
   * The referencing column, when known.
   */
  public column?: string

  /**
   * The name of the violated foreign key constraint, when known.
   */
  public constraint?: string

  public constructor(meta: ForeignKeyViolationMeta = {}) {
    const { table, column, constraint, driver, raw } = meta

    super({
      status: 409,
      code: 'E_FOREIGN_KEY_VIOLATION',
      message: `Foreign key constraint${
        constraint ? ` "${constraint}"` : ''
      } violated${table ? ` on table "${table}"` : ''}${
        column ? ` for column "${column}"` : ''
      }.`,
      help: `The referenced record does not exist or is still referenced by other records. Ensure the related row exists before persisting and is not deleted while referenced.`
    })

    this.table = table
    this.column = column
    this.constraint = constraint
    this.driver = driver
    this.raw = raw
  }
}
