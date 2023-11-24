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
import type { Direction, Operations } from '#src/types'
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
  private primaryKeyName: string
  private primaryKeyProperty: keyof M

  public constructor(model: typeof Model, driver: D) {
    super(driver, model.table())

    this.Model = model
    this.schema = model.schema()
    this.generator = new ModelGenerator<M>(this.Model as any)
    this.primaryKeyName = this.schema.getMainPrimaryKeyName()
    this.primaryKeyProperty = this.schema.getMainPrimaryKeyProperty() as any

    const deletedAtColumn = this.schema.getDeletedAtColumn()

    if (deletedAtColumn) {
      this.whereNull(deletedAtColumn.property as any)
    }

    this.setPrimaryKey(this.primaryKeyName)
  }

  /**
   * Calculate the average of a given column.
   */
  public async avg(column: keyof M): Promise<string> {
    const name = this.schema.getColumnNameByProperty(column)

    return super.avg(name)
  }

  /**
   * Calculate the average of a given column.
   */
  public async avgDistinct(column: keyof M): Promise<string> {
    const name = this.schema.getColumnNameByProperty(column)

    return super.avgDistinct(name)
  }

  /**
   * Get the max number of a given column.
   */
  public async max(column: keyof M): Promise<string> {
    const name = this.schema.getColumnNameByProperty(column)

    return super.max(name)
  }

  /**
   * Get the min number of a given column.
   */
  public async min(column: keyof M): Promise<string> {
    const name = this.schema.getColumnNameByProperty(column)

    return super.min(name)
  }

  /**
   * Sum all numbers of a given column.
   */
  public async sum(column: keyof M): Promise<string> {
    const name = this.schema.getColumnNameByProperty(column)

    return super.sum(name)
  }

  /**
   * Sum all numbers of a given column.
   */
  public async sumDistinct(column: keyof M): Promise<string> {
    const name = this.schema.getColumnNameByProperty(column)

    return super.sumDistinct(name)
  }

  /**
   * Increment a value of a given column.
   */
  public async increment(column: keyof M): Promise<void> {
    const name = this.schema.getColumnNameByProperty(column)

    return super.increment(name)
  }

  /**
   * Decrement a value of a given column.
   */
  public async decrement(column: keyof M): Promise<void> {
    const name = this.schema.getColumnNameByProperty(column)

    await super.decrement(name)
  }

  /**
   * Calculate the average of a given column using distinct.
   */
  public async count(column?: keyof M): Promise<string> {
    if (!column) {
      return super.count()
    }

    const name = this.schema.getColumnNameByProperty(column)

    return super.count(name)
  }

  /**
   * Calculate the average of a given column using distinct.
   */
  public async countDistinct(column: keyof M): Promise<string> {
    const name = this.schema.getColumnNameByProperty(column)

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
    data = data.map(d => {
      const date = new Date()
      const createdAt = this.schema.getCreatedAtColumn()
      const updatedAt = this.schema.getUpdatedAtColumn()
      const deletedAt = this.schema.getDeletedAtColumn()
      const attributes = this.Model.attributes()

      const parsed = this.schema.propertiesToColumnNames(d, {
        attributes,
        cleanPersist: true
      })

      if (createdAt && parsed[createdAt.name] === undefined) {
        parsed[createdAt.name] = date
      }

      if (updatedAt && parsed[updatedAt.name] === undefined) {
        parsed[updatedAt.name] = date
      }

      if (deletedAt && parsed[deletedAt.name] === undefined) {
        parsed[deletedAt.name] = null
      }

      return parsed
    })

    const created = await super.createMany(data)

    return this.generator.generateMany(created)
  }

  /**
   * Create or update a value in database.
   */
  public async createOrUpdate(data: Partial<M>) {
    const hasValue = await this.find()

    if (hasValue) {
      const pk = this.primaryKeyProperty

      return this.where(pk, hasValue[pk]).update(data)
    }

    return this.create(data)
  }

  /**
   * Update a value in database.
   */
  public async update(data: Partial<M>) {
    const date = new Date()
    const updatedAt = this.schema.getUpdatedAtColumn()
    const attributes = this.Model.attributes()

    const parsed = this.schema.propertiesToColumnNames(data, {
      attributes,
      cleanPersist: true
    })

    if (updatedAt && parsed[updatedAt.name] === undefined) {
      parsed[updatedAt.name] = date
    }

    const updated = await super.update(parsed)

    if (Is.Array(updated)) {
      return this.generator.generateMany(updated)
    }

    return this.generator.generateOne(updated)
  }

  /**
   * Delete or soft delete a value in database.
   */
  public async delete(force = false): Promise<void> {
    const column = this.schema.getDeletedAtColumn()

    if (!column || force) {
      await super.delete()

      return
    }

    await this.update({ [column.property]: new Date() } as any)
  }

  /**
   * Set the columns that should be selected on query.
   */
  public select(...columns: Array<keyof M>): this {
    super.select(...this.schema.getColumnNamesByProperties(columns))

    return this
  }

  /**
   * Set a group by statement in your query.
   */
  public groupBy(...columns: Array<keyof M>): this {
    super.groupBy(...this.schema.getColumnNamesByProperties(columns))

    return this
  }

  public having(column: keyof M): this
  public having(column: keyof M, value: any): this
  public having(column: keyof M, operation: Operations, value: any): this

  /**
   * Set a having statement in your query.
   */
  public having(
    column: keyof M,
    operation?: any | Operations,
    value?: any
  ): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.having(name, operation, value)

    return this
  }

  /**
   * Set a having in statement in your query.
   */
  public havingIn(column: keyof M, values: any[]): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.havingIn(name, values)

    return this
  }

  /**
   * Set a having not in statement in your query.
   */
  public havingNotIn(column: keyof M, values: any[]): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.havingNotIn(name, values)

    return this
  }

  /**
   * Set a having between statement in your query.
   */
  public havingBetween(column: keyof M, values: [any, any]): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.havingBetween(name, values)

    return this
  }

  /**
   * Set a having not between statement in your query.
   */
  public havingNotBetween(column: keyof M, values: [any, any]): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.havingNotBetween(name, values)

    return this
  }

  /**
   * Set a having null statement in your query.
   */
  public havingNull(column: keyof M): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.havingNull(name)

    return this
  }

  /**
   * Set a having not null statement in your query.
   */
  public havingNotNull(column: keyof M): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.havingNotNull(name)

    return this
  }

  public orHaving(column: keyof M): this
  public orHaving(column: keyof M, value: any): this
  public orHaving(column: keyof M, operation: Operations, value: any): this

  /**
   * Set a orHaving statement in your query.
   */
  public orHaving(
    column: keyof M,
    operation?: any | Operations,
    value?: any
  ): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.orHaving(name, operation, value)

    return this
  }

  /**
   * Set a orHaving in statement in your query.
   */
  public orHavingIn(column: keyof M, values: any[]): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.orHavingIn(name, values)

    return this
  }

  /**
   * Set a orHaving not in statement in your query.
   */
  public orHavingNotIn(column: keyof M, values: any[]): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.orHavingNotIn(name, values)

    return this
  }

  /**
   * Set a orHaving between statement in your query.
   */
  public orHavingBetween(column: keyof M, values: [any, any]): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.orHavingBetween(name, values)

    return this
  }

  /**
   * Set a orHaving not between statement in your query.
   */
  public orHavingNotBetween(column: keyof M, values: [any, any]): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.orHavingNotBetween(name, values)

    return this
  }

  /**
   * Set a orHaving null statement in your query.
   */
  public orHavingNull(column: keyof M): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.orHavingNull(name)

    return this
  }

  /**
   * Set a orHaving not null statement in your query.
   */
  public orHavingNotNull(column: keyof M): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.orHavingNotNull(name)

    return this
  }

  public where(statement: Partial<M>): this
  public where(statement: Record<string, any>): this
  public where(key: keyof M, value: any): this
  public where(key: keyof M, operation: Operations, value: any): this

  /**
   * Set a where statement in your query.
   */
  public where(
    statement: any,
    operation?: any | Operations,
    value?: any
  ): this {
    if (!operation) {
      const parsed = this.schema.propertiesToColumnNames(statement)

      super.where(parsed)

      return this
    }

    const name = this.schema.getColumnNameByProperty(statement)

    super.where(name, operation, value)

    return this
  }

  public whereNot(statement: Partial<M>): this
  public whereNot(statement: Record<string, any>): this
  public whereNot(key: keyof M, value: any): this

  /**
   * Set a where not statement in your query.
   */
  public whereNot(statement: any, value?: any): this {
    if (!value) {
      const parsed = this.schema.propertiesToColumnNames(statement)

      super.whereNot(parsed)

      return this
    }

    const name = this.schema.getColumnNameByProperty(statement)

    super.whereNot(name, value)

    return this
  }

  /**
   * Set a where like statement in your query.
   */
  public whereLike(column: keyof M, value: any): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.whereLike(name, value)

    return this
  }

  /**
   * Set a where ILike statement in your query.
   */
  public whereILike(column: keyof M, value: any): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.whereILike(name, value)

    return this
  }

  /**
   * Set a where in statement in your query.
   */
  public whereIn(column: keyof M, values: any[]): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.whereIn(name, values)

    return this
  }

  /**
   * Set a where not in statement in your query.
   */
  public whereNotIn(column: keyof M, values: any[]): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.whereNotIn(name, values)

    return this
  }

  /**
   * Set a where between statement in your query.
   */
  public whereBetween(column: keyof M, values: [any, any]): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.whereBetween(name, values)

    return this
  }

  /**
   * Set a where not between statement in your query.
   */
  public whereNotBetween(column: keyof M, values: [any, any]): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.whereNotBetween(name, values)

    return this
  }

  /**
   * Set a where null statement in your query.
   */
  public whereNull(column: keyof M): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.whereNull(name)

    return this
  }

  /**
   * Set a where not null statement in your query.
   */
  public whereNotNull(column: keyof M): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.whereNotNull(name)

    return this
  }

  public orWhere(statement: Partial<M>): this
  public orWhere(statement: Record<string, any>): this
  public orWhere(key: keyof M, value: any): this
  public orWhere(key: keyof M, operation: Operations, value: any): this

  /**
   * Set a orWhere statement in your query.
   */
  public orWhere(
    statement: any,
    operation?: any | Operations,
    value?: any
  ): this {
    if (!operation) {
      const parsed = this.schema.propertiesToColumnNames(statement)

      super.orWhere(parsed)

      return this
    }

    const name = this.schema.getColumnNameByProperty(statement)

    super.orWhere(name, operation, value)

    return this
  }

  public orWhereNot(statement: Partial<M>): this
  public orWhereNot(statement: Record<string, any>): this
  public orWhereNot(key: keyof M, value: any): this

  /**
   * Set a orWhere not statement in your query.
   */
  public orWhereNot(statement: any, value?: any): this {
    if (!value) {
      const parsed = this.schema.propertiesToColumnNames(statement)

      super.orWhereNot(parsed)

      return this
    }

    const name = this.schema.getColumnNameByProperty(statement)

    super.orWhereNot(name, value)

    return this
  }

  public orWhereLike(statement: Partial<M>): this
  public orWhereLike(statement: Record<string, any>): this
  public orWhereLike(key: keyof M, value: any): this

  /**
   * Set a orWhere like statement in your query.
   */
  public orWhereLike(statement: any, value?: any): this {
    if (!value) {
      const parsed = this.schema.propertiesToColumnNames(statement)

      super.orWhereLike(parsed)

      return this
    }

    const name = this.schema.getColumnNameByProperty(statement)

    super.orWhereLike(name, value)

    return this
  }

  public orWhereILike(statement: Partial<M>): this
  public orWhereILike(statement: Record<string, any>): this
  public orWhereILike(key: keyof M, value: any): this

  /**
   * Set a orWhere ILike statement in your query.
   */
  public orWhereILike(statement: any, value?: any): this {
    if (!value) {
      const parsed = this.schema.propertiesToColumnNames(statement)

      super.orWhereILike(parsed)

      return this
    }

    const name = this.schema.getColumnNameByProperty(statement)

    super.orWhereILike(name, value)

    return this
  }

  /**
   * Set a orWhere in statement in your query.
   */
  public orWhereIn(column: keyof M, values: any[]): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.orWhereIn(name, values)

    return this
  }

  /**
   * Set a orWhere not in statement in your query.
   */
  public orWhereNotIn(column: keyof M, values: any[]): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.orWhereNotIn(name, values)

    return this
  }

  /**
   * Set a orWhere between statement in your query.
   */
  public orWhereBetween(column: keyof M, values: [any, any]): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.orWhereBetween(name, values)

    return this
  }

  /**
   * Set a orWhere not between statement in your query.
   */
  public orWhereNotBetween(column: keyof M, values: [any, any]): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.orWhereNotBetween(name, values)

    return this
  }

  /**
   * Set a orWhere null statement in your query.
   */
  public orWhereNull(column: keyof M): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.orWhereNull(name)

    return this
  }

  /**
   * Set a orWhere not null statement in your query.
   */
  public orWhereNotNull(column: keyof M): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.orWhereNotNull(name)

    return this
  }

  /**
   * Set an order by statement in your query.
   */
  public orderBy(column: keyof M, direction: Direction = 'ASC'): this {
    const name = this.schema.getColumnNameByProperty(column)

    super.orderBy(name, direction)

    return this
  }

  /**
   * Order the results easily by the latest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   */
  public latest(column?: keyof M): this {
    if (!column) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      column = 'createdAt'
    }

    const name = this.schema.getColumnNameByProperty(column)

    super.latest(name)

    return this
  }

  /**
   * Order the results easily by the oldest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   */
  public oldest(column?: keyof M): this {
    if (!column) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      column = 'createdAt'
    }

    const name = this.schema.getColumnNameByProperty(column)

    super.oldest(name)

    return this
  }
}
