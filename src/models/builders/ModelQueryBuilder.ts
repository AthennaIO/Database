/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Collection, Is } from '@athenna/common'
import type { Model } from '#src/models/Model'
import type { Driver } from '#src/drivers/Driver'
import { QueryBuilder } from '#src/database/builders/QueryBuilder'
import { ModelGenerator } from '#src/models/factories/ModelGenerator'
import { NotFoundDataException } from '#src/exceptions/NotFoundDataException'

export class ModelQueryBuilder<
  M extends Model = any,
  D extends Driver = any
> extends QueryBuilder<M, D> {
  private Model: typeof Model
  private generator: ModelGenerator<M>

  public constructor(model: typeof Model, driver: D) {
    super(driver, model.table())

    this.setPrimaryKey(model.schema().getMainPrimaryKey()?.name || 'id')

    this.Model = model
    this.generator = new ModelGenerator<M>(this.Model as any)
  }

  /**
   * Find a value in database.
   */
  public async find() {
    const data = await super.find()

    return this.generator.generateOne(data)
  }

  /**
   * Find a value in database or throw exception if undefined.
   */
  public async findOrFail() {
    const data = await this.find()

    if (!data) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      throw new NotFoundDataException(this.Model.connection())
    }

    return data
  }

  /**
   * Return a single data or, if no results are found,
   * execute the given closure.
   */
  public async findOr<T = M>(closure: () => T | Promise<T>): Promise<T> {
    const data = (await this.find()) as T

    if (!data) {
      return closure()
    }

    return data
  }

  /**
   * Find many values in database.
   */
  public async findMany() {
    const data = await super.findMany()

    return this.generator.generateMany(data)
  }

  /**
   * Find many values in database and return
   * as a collection instance.
   */
  public async collection() {
    const data = await super.findMany()
    const models = await this.generator.generateMany(data)

    return new Collection(models)
  }

  /**
   * Create a value in database.
   */
  public async create(data: Partial<M>) {
    const created = await this.createMany([data])

    return created[0]
  }

  /**
   * Create many values in database.
   */
  public async createMany(data: Partial<M>[]) {
    const created = await super.createMany(data)

    return this.generator.generateMany(created)
  }

  /**
   * Create or update a value in database.
   */
  public async createOrUpdate(data: Partial<M>) {
    const created = await super.createOrUpdate(data)

    if (Is.Array(created)) {
      return this.generator.generateMany(created)
    }

    return this.generator.generateOne(created)
  }

  /**
   * Update a value in database.
   */
  public async update(data: Partial<M>) {
    const updated = await super.update(data)

    if (Is.Array(updated)) {
      return this.generator.generateMany(updated)
    }

    return this.generator.generateOne(updated)
  }

  /**
   * Delete or soft delete a value in database.
   */
  public async delete(force = false): Promise<void> {
    const column = this.Model.schema().getSoftDeleteColumn()

    if (!column || force) {
      await super.delete()

      return
    }

    await this.update({ [column.property]: new Date() } as any)
  }
}
