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
import { Is, Options } from '@athenna/common'
import type { BaseModel } from '#src/models/BaseModel'
import type { HasOneThroughOptions } from '#src/types/relations/HasOneThroughOptions'

/**
 * Create has one through relation for model class.
 */
export function HasOneThrough<
  T extends BaseModel = any,
  R extends BaseModel = any,
  H extends BaseModel = any
>(
  model: (() => new () => R) | string,
  through: (() => new () => H) | string,
  options: Omit<
    HasOneThroughOptions<T, R, H>,
    'type' | 'model' | 'through' | 'property'
  > = {}
) {
  return (target: T, key: any) => {
    const Target = target.constructor as typeof BaseModel

    options = Options.create(options, {
      isIncluded: false,
      inverse: false
    })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options.type = 'hasOneThrough'
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options.model = Is.String(model)
      ? () => ioc.safeUse(`App/Models/${model}`).constructor
      : model
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options.through = Is.String(through)
      ? () => ioc.safeUse(`App/Models/${through}`).constructor
      : through
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options.property = key

    debug(
      'registering hasOneThrough metadata for model %s: %o',
      Target.name,
      options
    )

    Annotation.defineHasOneThroughMeta(Target, options)
  }
}
