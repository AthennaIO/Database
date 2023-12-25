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
    let hasSetName = false

    if (options.name) {
      hasSetName = true
    }

    options = Options.create(options, {
      name: AthennaString.toCamelCase(key),
      type: Reflect.getMetadata('design:type', target, key),
      defaultTo: null,
      isPrimary: false,
      isHidden: false,
      isUnique: false,
      isNullable: true,
      isIndex: false,
      isSparse: false,
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

    const connection = Target.connection()
    const driver = Config.get(`database.connections.${connection}.driver`)

    if (!hasSetName && options.name === 'id' && driver === 'mongo') {
      options.name = '_id'
    }

    const Target = target.constructor

    debug('registering column metadata for model %s: %o', Target.name, options)

    Annotation.defineColumnMeta(Target, options)
  }
}
