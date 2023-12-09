/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'

import { debug } from '#src/debug'
import { Annotation } from '#src/helpers/Annotation'
import { Options, String as AthennaString } from '@athenna/common'
import type { ColumnOptions } from '#src/types/columns/ColumnOptions'

/**
 * Create column for model class.
 */
export function Column(
  options: Omit<ColumnOptions, 'property'> = {}
): PropertyDecorator {
  return (target: any, key: any) => {
    options = Options.create(options, {
      name: AthennaString.toCamelCase(key),
      defaultTo: null,
      isPrimary: false,
      isHidden: false,
      isUnique: false,
      isNullable: true,
      persist: true,
      isMainPrimary: false,
      isCreateDate: false,
      isUpdateDate: false,
      isDeleteDate: false
    })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options.property = key

    if (options.isMainPrimary) {
      options.isPrimary = true
    }

    const Target = target.constructor

    debug('Registering column metadata for model %s: %o', Target.name, options)

    Annotation.defineColumnMeta(Target, options)
  }
}
