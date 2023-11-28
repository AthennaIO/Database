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
import type { Model } from '#src/models/Model'
import { Annotation } from '#src/helpers/Annotation'
import type { BelongsToOptions } from '#src/types/relations/BelongsToOptions'

/**
 * Create belongs to relation for model class.
 */
export function BelongsTo(
  model: () => typeof Model,
  options: Omit<BelongsToOptions, 'type' | 'model' | 'property'> = {}
): PropertyDecorator {
  // TODO primaryKey and foreignKey options should respect the
  // type of main model and referenced model.
  return (target: any, key: any) => {
    const Target = target.constructor

    options = Options.create(options, {
      isIncluded: false,
      primaryKey: Target.schema().getMainPrimaryKeyName(),
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
