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
import { Options, String } from '@athenna/common'
import { Annotation } from '#src/helpers/Annotation'
import type { BaseModel } from '#src/models/BaseModel'
import type { BelongsToManyOptions } from '#src/types/relations/BelongsToManyOptions'

/**
 * Create belongs to many relation for model class.
 */
export function BelongsToMany<
  T extends BaseModel = any,
  R extends BaseModel = any,
  P extends BaseModel = any
>(
  model: () => new () => R,
  pivotModel: () => new () => P,
  options: Omit<
    BelongsToManyOptions<T, R, P>,
    'type' | 'model' | 'property'
  > = {}
) {
  return (target: T, key: any) => {
    const Target = target.constructor as typeof BaseModel

    options = Options.create(options, {
      isIncluded: false,
      primaryKey: Target.schema().getMainPrimaryKeyName() as any,
      foreignKey: `${String.toCamelCase(Target.name)}Id` as any,
      // Default value will be set later as: `${Model.table()}_${RelationModel.table()}`
      pivotTable: undefined,
      // Default value will be set later as: Relation.schema().getMainPrimaryKeyName()
      pivotPrimaryKey: undefined,
      // Default value will be set later as: `${String.toCamelCase(Relation.name)}Id`
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
    options.pivotModel = pivotModel
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
