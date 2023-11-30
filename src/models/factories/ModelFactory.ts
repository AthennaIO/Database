/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { debug } from '#src/debug'
import { Model } from '#src/models/Model'

export class ModelFactory<M extends Model = any, R = M> {
  /**
   * The model that will be used to fabricate
   * instances from.
   */
  private Model: typeof Model

  /**
   * The number of models to be created.
   */
  private _count = 1

  /**
   * Set if the soft delete state is active or not.
   */
  private _trashed = false

  /**
   * Set the returning key that this factory will return.
   */
  private _returning: keyof M | '*' = '*'

  public constructor(model: typeof Model) {
    this.Model = model
  }

  public returning(key: '*'): ModelFactory<M>
  public returning<T extends keyof M>(key: T): ModelFactory<M, M[T]>

  /**
   * Set the returning key that this factory will
   * return after making or creating an instance.
   */
  public returning(key: keyof M | '*') {
    this._returning = key

    return this as any
  }

  /**
   * Set the soft delete state in your model to
   * fabricate deleted data.
   */
  public trashed(): this {
    this._trashed = true

    return this
  }

  /**
   * Remove the soft delete state in your model to
   * not fabricate deleted data.
   */
  public untrashed(): this {
    this._trashed = false

    return this
  }

  public count(number: 1): {
    make(data: Partial<M>): Promise<R>
    create(data: Partial<M>): Promise<R>
  } & ModelFactory<M>

  public count(number: number): {
    make(data: Partial<M>): Promise<R[]>
    create(data: Partial<M>): Promise<R[]>
  } & ModelFactory<M>

  /**
   * Set the number of models to be created.
   */
  public count(number: number) {
    this._count = number

    return this as any
  }

  /**
   * Make models without creating it on database.
   */
  public async make(override: Partial<M> = {}): Promise<R | R[]> {
    const promises = []

    for (let i = 1; i <= this._count; i++) {
      promises.push(this.getDefinition(override, 'make'))
    }

    let data = await Promise.all(promises)

    data = data.map(d => {
      if (this._returning !== '*') {
        return d[this._returning]
      }

      const model = new this.Model()

      Object.keys(d).forEach(key => (model[key] = d[key]))

      return model
    })

    if (this._count === 1) {
      return data[0]
    }

    return data
  }

  /**
   * Create models creating it on database.
   */
  public async create(override: Partial<M> = {}): Promise<R | R[]> {
    const promises = []

    for (let i = 1; i <= this._count; i++) {
      promises.push(this.getDefinition(override, 'create'))
    }

    let data = await this.Model.createMany(await Promise.all(promises))

    if (this._returning !== '*') {
      data = data.map(d => d[this._returning as any])
    }

    if (this._count === 1) {
      return data[0] as any
    }

    return data as any
  }

  /**
   * Execute the definition method and return data.
   */
  private async getDefinition(override: Partial<M>, method: 'make' | 'create') {
    const data = await this.Model.definition()

    const promises = Object.keys(data).reduce((promises, key) => {
      if ((override && override[key]) || !(data[key] instanceof ModelFactory)) {
        return promises
      }

      const SubFactory = data[key]
      const result = SubFactory[method]().then(r => (data[key] = r))

      promises.push(result)

      return promises
    }, [])

    await Promise.all(promises)

    if (this._trashed) {
      const column = this.Model.schema().getDeletedAtColumn()

      if (!column) {
        debug(
          'there is any column with isDeleteDate option as true in model %s. trashed option will be ignored.',
          this.Model.name
        )
      } else {
        data[column.property] = new Date()
      }
    }

    return {
      ...data,
      ...override
    }
  }
}
