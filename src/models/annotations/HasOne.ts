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
import type { Model } from '#src/models/Model'
import { Options, String } from '@athenna/common'
import { Annotation } from '#src/helpers/Annotation'
import type { HasOneOptions } from '#src/types/relations/HasOneOptions'

/**
 * Create has one relation for model class.
 */
export function HasOne<T extends Model = any, R extends Model = any>(
  model: () => new () => R,
  options: Omit<HasOneOptions<T, R>, 'type' | 'model' | 'property'> = {}
) {
  return (target: T, key: string) => {
    const Target = target.constructor as typeof Model

    options = Options.create(options, {
      isIncluded: false,
      primaryKey: Target.schema().getMainPrimaryKeyName() as any,
      foreignKey: `${String.toCamelCase(Target.name)}Id` as any
    })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options.type = 'hasOne'
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options.model = model
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options.property = key

    debug('Registering hasOne metadata for model %s: %o', Target.name, options)

    Annotation.defineHasOneMeta(Target, options)
  }
}
