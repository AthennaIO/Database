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
import { Is, Options, String } from '@athenna/common'
import type { BaseModel } from '#src/models/BaseModel'
import type { HasManyOptions } from '#src/types/relations/HasManyOptions'

/**
 * Create has many relation for model class.
 */
export function HasMany<T extends BaseModel = any, R extends BaseModel = any>(
  model: (() => new () => R) | string,
  options: Omit<HasManyOptions, 'type' | 'model' | 'property'> = {}
) {
  return (target: T, key: any) => {
    const Target = target.constructor as typeof BaseModel

    options = Options.create(options, {
      isIncluded: false,
      primaryKey: Target.schema().getMainPrimaryKeyName(),
      foreignKey: `${String.toCamelCase(Target.name)}Id`
    })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options.type = 'hasMany'
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options.model = Is.String(model)
      ? () => ioc.safeUse(`App/Models/${model}`).constructor
      : model
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options.property = key

    debug('registering hasMany metadata for model %s: %o', Target.name, options)

    Annotation.defineHasManyMeta(Target, options)
  }
}
