/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ConstraintViolationException } from '#src/exceptions/ConstraintViolationException'

export type CheckViolationMeta = {
  table?: string
  constraint?: string
  driver?: string
  raw?: any
}

export class CheckViolationException extends ConstraintViolationException {
  /**
   * The name of the violated check constraint, when known.
   */
  public constraint?: string

  public constructor(meta: CheckViolationMeta = {}) {
    const { table, constraint, driver, raw } = meta

    super({
      status: 422,
      code: 'E_CHECK_VIOLATION',
      message: `Check constraint${
        constraint ? ` "${constraint}"` : ''
      } violated${table ? ` on table "${table}"` : ''}.`,
      help: `The persisted value does not satisfy the check constraint ${
        constraint ? `"${constraint}"` : ''
      }. Provide a value that respects the constraint definition.`
    })

    this.table = table
    this.constraint = constraint
    this.driver = driver
    this.raw = raw
  }
}
