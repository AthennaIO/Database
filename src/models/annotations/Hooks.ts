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
import type { ModelHookType } from '#src/types'

/**
 * Register a static model method as a lifecycle hook. Hooks are
 * inherited by child models and fired parent-first, in declaration
 * order. The payload each hook receives depends on the operation,
 * see {@link ModelHookOptions.method}.
 */
function createHookAnnotation(type: ModelHookType): MethodDecorator {
  return (target: any, key: any, descriptor: PropertyDescriptor) => {
    /**
     * Static methods hand the constructor as target, instance
     * methods hand the prototype. `Is.Function()` can't be used
     * here because it returns false for classes.
     */
    const Target = typeof target === 'function' ? target : target.constructor

    debug('registering %s hook for model %s: %s', type, Target.name, key)

    Annotation.defineHookMeta(Target, { type, method: descriptor.value })
  }
}

/**
 * Fire the method before creating models. Receives the data object
 * (query/static creates) or the model instance (`model.save()`) and
 * may mutate it to change what is persisted.
 */
export function BeforeCreate(): MethodDecorator {
  return createHookAnnotation('beforeCreate')
}

/**
 * Fire the method after creating models. Receives each created
 * model instance.
 */
export function AfterCreate(): MethodDecorator {
  return createHookAnnotation('afterCreate')
}

/**
 * Fire the method before updating models. Receives the data object
 * (query/static updates) or the model instance (`model.save()`) and
 * may mutate it to change what is persisted.
 */
export function BeforeUpdate(): MethodDecorator {
  return createHookAnnotation('beforeUpdate')
}

/**
 * Fire the method after updating models. Receives each updated
 * model instance.
 */
export function AfterUpdate(): MethodDecorator {
  return createHookAnnotation('afterUpdate')
}

/**
 * Fire the method before creating or updating models, always before
 * the `beforeCreate`/`beforeUpdate` hooks. Receives the same payload
 * they do.
 */
export function BeforeSave(): MethodDecorator {
  return createHookAnnotation('beforeSave')
}

/**
 * Fire the method after creating or updating models, always after
 * the `afterCreate`/`afterUpdate` hooks. Receives the same payload
 * they do.
 */
export function AfterSave(): MethodDecorator {
  return createHookAnnotation('afterSave')
}

/**
 * Fire the method before deleting a model via `model.delete()`.
 * Receives the model instance. Query/static deletes (bulk) don't
 * fire delete hooks since there is no instance to hand over.
 */
export function BeforeDelete(): MethodDecorator {
  return createHookAnnotation('beforeDelete')
}

/**
 * Fire the method after deleting a model via `model.delete()`.
 * Receives the model instance.
 */
export function AfterDelete(): MethodDecorator {
  return createHookAnnotation('afterDelete')
}

/**
 * Fire the method before executing `find()`, `findMany()` and
 * `paginate()` queries. Receives the model query builder, so the
 * hook can add default constraints.
 */
export function BeforeFind(): MethodDecorator {
  return createHookAnnotation('beforeFind')
}

/**
 * Fire the method after retrieving models from `find()`, `findMany()`
 * and `paginate()` queries. Receives each model instance retrieved.
 * Not fired for custom selects, which return raw data.
 */
export function AfterFind(): MethodDecorator {
  return createHookAnnotation('afterFind')
}
