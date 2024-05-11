/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is } from '@athenna/common'
import { ServiceProvider } from '@athenna/ioc'

type UniqueOptions = {
  /**
   * The table where the database will lookup for the data.
   */
  table: string

  /**
   * The column name in database. If not defined, the name
   * of the field in the schema will be used.
   *
   * @default 'fieldNameInYourSchema'
   */
  column?: string

  /**
   * Use the max field to stablish a max limit for your validation.
   * In some cases in your database you might have a max of 10 tuples
   * with the same data. Use this option to validate that the number
   * of fields registered in database cannot be bigger than the number
   * defined on this option.
   *
   * @example
   * ```ts
   * const schema = this.validator.object({
   *   name: this.validator.string().unique({ table: 'users', max: 10 })
   * })
   *
   * const data = { name: 'lenon' }
   *
   * // Will throw if there are 10 users with name `lenon`
   * // created in database
   * await this.validator.validate({ schema: this.schema, data })
   * ```
   * @default undefined
   */
  max?: number
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
declare module '@vinejs/vine' {
  interface VineString {
    unique(options: UniqueOptions): this
  }
}

export class DatabaseValidatorProvider extends ServiceProvider {
  public async boot() {
    if (!ioc.has('Athenna/Core/Validator')) {
      return
    }

    const DB = ioc.safeUse('Athenna/Core/Database')
    const validator = ioc.safeUse('Athenna/Core/Validator')

    validator.extend().string('unique', async (value, options, field) => {
      /**
       * We do not want to deal with non-string
       * values. The "string" rule will handle the
       * the validation.
       */
      if (!Is.String(value)) {
        return
      }

      if (!options.column) {
        options.column = field.name as string
      }

      if (options.max) {
        const rows = await DB.table(options.table)
          .select(options.column)
          .where(options.column, value)
          .findMany()

        if (rows.length > options.max) {
          field.report('The {{ field }} field is not unique', 'unique', field)
        }

        return
      }

      const existsRow = await DB.table(options.table)
        .select(options.column)
        .where(options.column, value)
        .exists()

      if (existsRow) {
        field.report('The {{ field }} field is not unique', 'unique', field)
      }
    })
  }
}
