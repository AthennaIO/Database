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
import { Options } from '@athenna/common'
import { Annotation } from '#src/helpers/Annotation'
import type { BaseModel } from '#src/models/BaseModel'
import type { BelongsToOptions } from '#src/types/relations/BelongsToOptions'

/**
 * Create belongs to relation for model class.
 */
export function BelongsTo<T extends BaseModel = any, R extends BaseModel = any>(
  model: () => new () => R,
  options: Omit<BelongsToOptions<T, R>, 'type' | 'model' | 'property'> = {}
) {
  return (target: T, key: any) => {
    const Target = target.constructor as typeof BaseModel

    options = Options.create(options, {
      isIncluded: false,
      // Default will be set later as: RelationModel.schema().getMainPrimaryKeyName()
      primaryKey: undefined,
      // Default will be set later as: `${String.toCamelCase(RelationModel.name)}Id`
      foreignKey: undefined
    })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options.type = 'belongsTo'
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options.model = model
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options.property = key

    debug(
      'Registering belongsTo metadata for model %s: %o',
      Target.name,
      options
    )

    Annotation.defineBelongsToMeta(Target, options)
  }
}
