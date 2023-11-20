/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Model } from '#src/models/Model'
import { Collection, Is } from '@athenna/common'
import type { Driver } from '#src/drivers/Driver'
import { QueryBuilder } from '#src/database/builders/QueryBuilder'
import type { ModelSchema } from '#src/models/schemas/ModelSchema'
import { ModelGenerator } from '#src/models/factories/ModelGenerator'
import { NotFoundDataException } from '#src/exceptions/NotFoundDataException'

export class ModelQueryBuilder<
  M extends Model = any,
  D extends Driver = any
> extends QueryBuilder<M, D> {
  private Model: typeof Model
  private schema: ModelSchema<M>
  private generator: ModelGenerator<M>

  public constructor(model: typeof Model, driver: D) {
    super(driver, model.table())

    this.Model = model
    this.schema = model.schema()
    this.generator = new ModelGenerator<M>(this.Model as any)

    this.setPrimaryKey(this.schema.getMainPrimaryKey()?.name || 'id')
  }

  /**
   * Calculate the average of a given column.
   */
  public async avg(column: keyof M): Promise<string> {
    const { name } = this.schema.getColumnByProperty(column)

    return super.avg(name)
  }

  /**
   * Calculate the average of a given column.
   */
  public async avgDistinct(column: keyof M): Promise<string> {
    const { name } = this.schema.getColumnByProperty(column)

    return super.avgDistinct(name)
  }

  /**
   * Get the max number of a given column.
   */
  public async max(column: keyof M): Promise<string> {
    const { name } = this.schema.getColumnByProperty(column)

    return super.max(name)
  }

  /**
   * Get the min number of a given column.
   */
  public async min(column: keyof M): Promise<string> {
    const { name } = this.schema.getColumnByProperty(column)

    return super.min(name)
  }

  /**
   * Sum all numbers of a given column.
   */
  public async sum(column: keyof M): Promise<string> {
    const { name } = this.schema.getColumnByProperty(column)

    return super.sum(name)
  }

  /**
   * Sum all numbers of a given column.
   */
  public async sumDistinct(column: keyof M): Promise<string> {
    const { name } = this.schema.getColumnByProperty(column)

    return super.sumDistinct(name)
  }

  /**
   * Increment a value of a given column.
   */
  public async increment(column: keyof M): Promise<void> {
    const { name } = this.schema.getColumnByProperty(column)

    return super.increment(name)
  }

  /**
   * Decrement a value of a given column.
   */
  public async decrement(column: keyof M): Promise<void> {
    const { name } = this.schema.getColumnByProperty(column)

    await super.decrement(name)
  }

  /**
   * Calculate the average of a given column using distinct.
   */
  public async count(column?: keyof M): Promise<string> {
    if (!column) {
      return super.count()
    }

    const { name } = this.schema.getColumnByProperty(column)

    return super.count(name)
  }

  /**
   * Calculate the average of a given column using distinct.
   */
  public async countDistinct(column: keyof M): Promise<string> {
    const { name } = this.schema.getColumnByProperty(column)

    return super.countDistinct(name)
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
    const column = this.schema.getSoftDeleteColumn()

    if (!column || force) {
      await super.delete()

      return
    }

    await this.update({ [column.property]: new Date() } as any)
  }
}
