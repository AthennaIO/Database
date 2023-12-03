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
import type { BelongsToManyOptions } from '#src/types/relations/BelongsToManyOptions'

/**
 * Create belongs to many relation for model class.
 */
export function BelongsToMany<T extends Model = any, R extends Model = any>(
  model: () => new () => R,
  options: Omit<BelongsToManyOptions<T, R>, 'type' | 'model' | 'property'> = {}
) {
  return (target: T, key: any) => {
    const Target = target.constructor as typeof Model

    options = Options.create(options, {
      isIncluded: false,
      primaryKey: Target.schema().getMainPrimaryKeyName() as any,
      foreignKey: `${String.toCamelCase(Target.name)}Id` as any,
      // To avoid import issues, the above values be set only when resolving the relation.
      pivotTable: undefined,
      pivotPrimaryKey: undefined,
      pivotForeignKey: undefined
    })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options.type = 'belongsToMany'
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options.model = model
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options.property = key

    debug(
      'Registering belongsToMany metadata for model %s: %o',
      Target.name,
      options
    )

    Annotation.defineBelongsToManyMeta(Target, options)
  }
}
