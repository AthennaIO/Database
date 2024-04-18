/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type {
  Direction,
  Operations,
  ModelColumns,
  ModelRelations
} from '#src/types'
import type { BaseModel } from '#src/models/BaseModel'
import { Collection, Is, Options } from '@athenna/common'
import type { Driver } from '#src/database/drivers/Driver'
import { QueryBuilder } from '#src/database/builders/QueryBuilder'
import type { ModelSchema } from '#src/models/schemas/ModelSchema'
import { ModelGenerator } from '#src/models/factories/ModelGenerator'
import { UniqueValueException } from '#src/exceptions/UniqueValueException'
import { NotFoundDataException } from '#src/exceptions/NotFoundDataException'
import { NullableValueException } from '#src/exceptions/NullableValueException'

export class ModelQueryBuilder<
  M extends BaseModel = any,
  D extends Driver = any
> extends QueryBuilder<M, D> {
  private Model: typeof BaseModel
  private schema: ModelSchema<M>
  private generator: ModelGenerator<M>
  private primaryKeyName: string
  private primaryKeyProperty: ModelColumns<M>
  private isToSetAttributes: boolean = true
  private isToValidateUnique: boolean = true
  private isToValidateNullable: boolean = true
  private selectColumns: string[] = []
  private DELETED_AT_PROP: any = null
  private DELETED_AT_NAME: any = null
  private isSoftDelete: boolean = false
  private hasCustomSelect: boolean = false

  public constructor(model: any, driver: D) {
    super(driver, model.table())

    this.Model = model
    this.schema = model.schema()
    this.generator = new ModelGenerator<M>(this.Model as any, this.schema)
    this.primaryKeyName = this.schema.getMainPrimaryKeyName()
    this.primaryKeyProperty = this.schema.getMainPrimaryKeyProperty() as any

    const deletedAtColumn = this.schema.getDeletedAtColumn()
    const properties = this.schema.getAllColumnProperties()

    if (deletedAtColumn) {
      this.isSoftDelete = true
      this.DELETED_AT_NAME = deletedAtColumn.name
      this.DELETED_AT_PROP = deletedAtColumn.property
    }

    this.selectColumns = properties
    this.setPrimaryKey(this.primaryKeyName)
  }

  /**
   * Calculate the average of a given column.
   */
  public async avg(column: ModelColumns<M>): Promise<string> {
    this.setInternalQueries()

    const name = this.schema.getColumnNameByProperty(column)

    return super.avg(name as any)
  }

  /**
   * Calculate the average of a given column.
   */
  public async avgDistinct(column: ModelColumns<M>): Promise<string> {
    this.setInternalQueries()

    const name = this.schema.getColumnNameByProperty(column)

    return super.avgDistinct(name as any)
  }

  /**
   * Get the max number of a given column.
   */
  public async max(column: ModelColumns<M>): Promise<string> {
    this.setInternalQueries()

    const name = this.schema.getColumnNameByProperty(column)

    return super.max(name as any)
  }

  /**
   * Get the min number of a given column.
   */
  public async min(column: ModelColumns<M>): Promise<string> {
    this.setInternalQueries()

    const name = this.schema.getColumnNameByProperty(column)

    return super.min(name as any)
  }

  /**
   * Sum all numbers of a given column.
   */
  public async sum(column: ModelColumns<M>): Promise<string> {
    this.setInternalQueries()

    const name = this.schema.getColumnNameByProperty(column)

    return super.sum(name as any)
  }

  /**
   * Sum all numbers of a given column.
   */
  public async sumDistinct(column: ModelColumns<M>): Promise<string> {
    this.setInternalQueries()

    const name = this.schema.getColumnNameByProperty(column)

    return super.sumDistinct(name as any)
  }

  /**
   * Increment a value of a given column.
   */
  public async increment(column: ModelColumns<M>): Promise<void> {
    this.setInternalQueries()

    const name = this.schema.getColumnNameByProperty(column)

    return super.increment(name as any)
  }

  /**
   * Decrement a value of a given column.
   */
  public async decrement(column: ModelColumns<M>): Promise<void> {
    this.setInternalQueries()

    const name = this.schema.getColumnNameByProperty(column)

    await super.decrement(name as any)
  }

  /**
   * Calculate the average of a given column using distinct.
   */
  public async count(column?: ModelColumns<M>): Promise<string> {
    this.setInternalQueries()

    if (!column) {
      return super.count()
    }

    const name = this.schema.getColumnNameByProperty(column)

    return super.count(name as any)
  }

  /**
   * Calculate the average of a given column using distinct.
   */
  public async countDistinct(column: ModelColumns<M>): Promise<string> {
    this.setInternalQueries()

    const name = this.schema.getColumnNameByProperty(column)

    return super.countDistinct(name as any)
  }

  /**
   * Find a value in database.
   */
  public async find() {
    this.setInternalQueries()

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
    const data = (await this.find()) as unknown as T

    if (!data) {
      return closure()
    }

    return data
  }

  /**
   * Find many values in database.
   */
  public async findMany() {
    this.setInternalQueries()

    const data = await super.findMany()

    return this.generator.generateMany(data)
  }

  /**
   * Find many values in database and return
   * as a collection instance.
   */
  public async collection() {
    const models = await this.findMany()

    return new Collection(models)
  }

  /**
   * Create a value in database.
   */
  public async create(data: Partial<M> = {}, cleanPersist = true) {
    const created = await this.createMany([data], cleanPersist)

    return created[0]
  }

  /**
   * Create many values in database.
   */
  public async createMany(data: Partial<M>[], cleanPersist = true) {
    data = await Promise.all(
      data.map(async d => {
        const date = new Date()
        const createdAt = this.schema.getCreatedAtColumn()
        const updatedAt = this.schema.getUpdatedAtColumn()
        const deletedAt = this.schema.getDeletedAtColumn()
        const attributes = this.isToSetAttributes ? this.Model.attributes() : {}

        const parsed = this.schema.propertiesToColumnNames(d, {
          attributes,
          cleanPersist
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

        this.validateNullable(parsed)
        await this.validateUnique(parsed)

        return parsed
      })
    )

    const created = await super.createMany(data)

    return this.generator.generateMany(created)
  }

  /**
   * Create or update a value in database.
   */
  public async createOrUpdate(data: Partial<M>, cleanPersist = true) {
    const hasValue = await this.find()

    if (hasValue) {
      const pk = this.primaryKeyProperty

      return this.where(pk, hasValue[pk as any]).update(data, cleanPersist)
    }

    return this.create(data, cleanPersist)
  }

  /**
   * Update a value in database.
   */
  public async update(data: Partial<M>, cleanPersist = true) {
    this.setInternalQueries()

    const date = new Date()
    const updatedAt = this.schema.getUpdatedAtColumn()
    const attributes = this.isToSetAttributes ? this.Model.attributes() : {}

    const parsed = this.schema.propertiesToColumnNames(data, {
      attributes,
      cleanPersist
    })

    if (updatedAt && parsed[updatedAt.name] === undefined) {
      parsed[updatedAt.name] = date
    }

    await this.validateUnique(parsed, true)

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
    this.setInternalQueries({ addSelect: false })

    if (!this.DELETED_AT_NAME || force) {
      await super.delete()

      return
    }

    await this.update({ [this.DELETED_AT_PROP]: new Date() } as any)
  }

  /**
   * Restore one or multiple soft deleted models.
   */
  public async restore() {
    this.setInternalQueries({ addSoftDelete: false })

    if (!this.DELETED_AT_PROP) {
      return
    }

    const updatedAt = this.schema.getUpdatedAtColumn()
    const data = { [this.DELETED_AT_PROP]: null } as any

    if (updatedAt) {
      data[updatedAt.name] = new Date()
    }

    const updated = await super.update(data)

    if (Is.Array(updated)) {
      return this.generator.generateMany(updated)
    }

    return this.generator.generateOne(updated)
  }

  /**
   * Retrieve only the values that are soft deleted in
   * database.
   */
  public onlyTrashed() {
    this.isSoftDelete = false

    if (!this.DELETED_AT_PROP) {
      return this
    }

    return this.whereNotNull(this.DELETED_AT_PROP)
  }

  /**
   * Retrieve values that are soft deleted in database.
   */
  public withTrashed() {
    this.isSoftDelete = false

    if (!this.DELETED_AT_PROP) {
      return
    }

    return this.whereNull(this.DELETED_AT_PROP).whereNotNull(
      this.DELETED_AT_PROP
    )
  }

  /**
   * Enable/disable setting the default attributes properties
   * when creating/updating models.
   */
  public setAttributes(value: boolean) {
    this.isToSetAttributes = value

    return this
  }

  /**
   * Enable/disable the `isUnique` property validation of
   * models columns.
   */
  public uniqueValidation(value: boolean) {
    this.isToValidateUnique = value

    return this
  }

  /**
   * Enable/disable the `isNullable` property validation of
   * models columns.
   */
  public nullableValidation(value: boolean) {
    this.isToValidateNullable = value

    return this
  }

  public with(relation: string): this
  public with<K extends ModelRelations<M>>(
    relation: K,
    closure?: (
      query: ModelQueryBuilder<
        Extract<M[K] extends BaseModel[] ? M[K][0] : M[K], BaseModel>,
        Driver
      >
    ) => any
  ): this

  /**
   * Eager load a relation in your query.
   */
  public with<K extends ModelRelations<M>>(
    relation: K | string,
    closure?: (
      query: ModelQueryBuilder<
        Extract<M[K] extends BaseModel[] ? M[K][0] : M[K], BaseModel>,
        Driver
      >
    ) => any
  ) {
    this.schema.includeRelation(relation, closure)

    return this
  }

  /**
   * Executes the given closure when the first argument is true.
   */
  public when(
    criteria: any,
    closure: (query: this, criteriaValue: any) => any | Promise<any>
  ) {
    if (criteria) {
      closure(this, criteria)

      return this
    }

    return this
  }

  /**
   * Set the columns that should be selected on query.
   */
  public select(...columns: ModelColumns<M>[]) {
    if (!this.hasCustomSelect) {
      this.hasCustomSelect = true
      this.selectColumns = columns.map(c =>
        this.schema.getColumnNameByProperty(c)
      )

      return this
    }

    columns.forEach(column => {
      const index = this.selectColumns.indexOf(column)

      if (index) {
        return
      }

      this.selectColumns.push(this.schema.getColumnNameByProperty(column))
    })

    return this
  }

  /**
   * Set a group by statement in your query.
   */
  public groupBy(...columns: ModelColumns<M>[]) {
    super.groupBy(...this.schema.getColumnNamesByProperties(columns))

    return this
  }

  public having(column: ModelColumns<M>): this
  public having(column: ModelColumns<M>, value: any): this
  public having(
    column: ModelColumns<M>,
    operation: Operations,
    value: any
  ): this

  /**
   * Set a having statement in your query.
   */
  public having(
    column: ModelColumns<M>,
    operation?: any | Operations,
    value?: any
  ) {
    const name = this.schema.getColumnNameByProperty(column)

    super.having(name, operation, value)

    return this
  }

  /**
   * Set a having in statement in your query.
   */
  public havingIn(column: ModelColumns<M>, values: any[]) {
    const name = this.schema.getColumnNameByProperty(column)

    super.havingIn(name, values)

    return this
  }

  /**
   * Set a having not in statement in your query.
   */
  public havingNotIn(column: ModelColumns<M>, values: any[]) {
    const name = this.schema.getColumnNameByProperty(column)

    super.havingNotIn(name, values)

    return this
  }

  /**
   * Set a having between statement in your query.
   */
  public havingBetween(column: ModelColumns<M>, values: [any, any]) {
    const name = this.schema.getColumnNameByProperty(column)

    super.havingBetween(name, values)

    return this
  }

  /**
   * Set a having not between statement in your query.
   */
  public havingNotBetween(column: ModelColumns<M>, values: [any, any]) {
    const name = this.schema.getColumnNameByProperty(column)

    super.havingNotBetween(name, values)

    return this
  }

  /**
   * Set a having null statement in your query.
   */
  public havingNull(column: ModelColumns<M>) {
    const name = this.schema.getColumnNameByProperty(column)

    super.havingNull(name)

    return this
  }

  /**
   * Set a having not null statement in your query.
   */
  public havingNotNull(column: ModelColumns<M>) {
    const name = this.schema.getColumnNameByProperty(column)

    super.havingNotNull(name)

    return this
  }

  public orHaving(column: ModelColumns<M>): this
  public orHaving(column: ModelColumns<M>, value: any): this
  public orHaving(
    column: ModelColumns<M>,
    operation: Operations,
    value: any
  ): this

  /**
   * Set a orHaving statement in your query.
   */
  public orHaving(
    column: ModelColumns<M>,
    operation?: any | Operations,
    value?: any
  ) {
    const name = this.schema.getColumnNameByProperty(column)

    super.orHaving(name, operation, value)

    return this
  }

  /**
   * Set a orHaving in statement in your query.
   */
  public orHavingIn(column: ModelColumns<M>, values: any[]) {
    const name = this.schema.getColumnNameByProperty(column)

    super.orHavingIn(name, values)

    return this
  }

  /**
   * Set a orHaving not in statement in your query.
   */
  public orHavingNotIn(column: ModelColumns<M>, values: any[]) {
    const name = this.schema.getColumnNameByProperty(column)

    super.orHavingNotIn(name, values)

    return this
  }

  /**
   * Set a orHaving between statement in your query.
   */
  public orHavingBetween(column: ModelColumns<M>, values: [any, any]) {
    const name = this.schema.getColumnNameByProperty(column)

    super.orHavingBetween(name, values)

    return this
  }

  /**
   * Set a orHaving not between statement in your query.
   */
  public orHavingNotBetween(column: ModelColumns<M>, values: [any, any]) {
    const name = this.schema.getColumnNameByProperty(column)

    super.orHavingNotBetween(name, values)

    return this
  }

  /**
   * Set a orHaving null statement in your query.
   */
  public orHavingNull(column: ModelColumns<M>) {
    const name = this.schema.getColumnNameByProperty(column)

    super.orHavingNull(name)

    return this
  }

  /**
   * Set a orHaving not null statement in your query.
   */
  public orHavingNotNull(column: ModelColumns<M>) {
    const name = this.schema.getColumnNameByProperty(column)

    super.orHavingNotNull(name)

    return this
  }

  public where(statement: Partial<M>): this
  public where(statement: Record<string, any>): this
  public where(key: ModelColumns<M>, value: any): this
  public where(key: ModelColumns<M>, operation: Operations, value: any): this

  /**
   * Set a where statement in your query.
   */
  public where(statement: any, operation?: any | Operations, value?: any) {
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
  public whereNot(key: ModelColumns<M>, value: any): this

  /**
   * Set a where not statement in your query.
   */
  public whereNot(statement: any, value?: any) {
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
  public whereLike(column: ModelColumns<M>, value: any) {
    const name = this.schema.getColumnNameByProperty(column)

    super.whereLike(name, value)

    return this
  }

  /**
   * Set a where ILike statement in your query.
   */
  public whereILike(column: ModelColumns<M>, value: any) {
    const name = this.schema.getColumnNameByProperty(column)

    super.whereILike(name, value)

    return this
  }

  /**
   * Set a where in statement in your query.
   */
  public whereIn(column: ModelColumns<M>, values: any[]) {
    const name = this.schema.getColumnNameByProperty(column)

    super.whereIn(name, values)

    return this
  }

  /**
   * Set a where not in statement in your query.
   */
  public whereNotIn(column: ModelColumns<M>, values: any[]) {
    const name = this.schema.getColumnNameByProperty(column)

    super.whereNotIn(name, values)

    return this
  }

  /**
   * Set a where between statement in your query.
   */
  public whereBetween(column: ModelColumns<M>, values: [any, any]) {
    const name = this.schema.getColumnNameByProperty(column)

    super.whereBetween(name, values)

    return this
  }

  /**
   * Set a where not between statement in your query.
   */
  public whereNotBetween(column: ModelColumns<M>, values: [any, any]) {
    const name = this.schema.getColumnNameByProperty(column)

    super.whereNotBetween(name, values)

    return this
  }

  /**
   * Set a where null statement in your query.
   */
  public whereNull(column: ModelColumns<M>) {
    const name = this.schema.getColumnNameByProperty(column)

    super.whereNull(name)

    return this
  }

  /**
   * Set a where not null statement in your query.
   */
  public whereNotNull(column: ModelColumns<M>) {
    const name = this.schema.getColumnNameByProperty(column)

    super.whereNotNull(name)

    return this
  }

  public orWhere(statement: Partial<M>): this
  public orWhere(statement: Record<string, any>): this
  public orWhere(key: ModelColumns<M>, value: any): this
  public orWhere(key: ModelColumns<M>, operation: Operations, value: any): this

  /**
   * Set a orWhere statement in your query.
   */
  public orWhere(statement: any, operation?: any | Operations, value?: any) {
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
  public orWhereNot(key: ModelColumns<M>, value: any): this

  /**
   * Set a orWhere not statement in your query.
   */
  public orWhereNot(statement: any, value?: any) {
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
  public orWhereLike(key: ModelColumns<M>, value: any): this

  /**
   * Set a orWhere like statement in your query.
   */
  public orWhereLike(statement: any, value?: any) {
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
  public orWhereILike(key: ModelColumns<M>, value: any): this

  /**
   * Set a orWhere ILike statement in your query.
   */
  public orWhereILike(statement: any, value?: any) {
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
  public orWhereIn(column: ModelColumns<M>, values: any[]) {
    const name = this.schema.getColumnNameByProperty(column)

    super.orWhereIn(name, values)

    return this
  }

  /**
   * Set a orWhere not in statement in your query.
   */
  public orWhereNotIn(column: ModelColumns<M>, values: any[]) {
    const name = this.schema.getColumnNameByProperty(column)

    super.orWhereNotIn(name, values)

    return this
  }

  /**
   * Set a orWhere between statement in your query.
   */
  public orWhereBetween(column: ModelColumns<M>, values: [any, any]) {
    const name = this.schema.getColumnNameByProperty(column)

    super.orWhereBetween(name, values)

    return this
  }

  /**
   * Set a orWhere not between statement in your query.
   */
  public orWhereNotBetween(column: ModelColumns<M>, values: [any, any]) {
    const name = this.schema.getColumnNameByProperty(column)

    super.orWhereNotBetween(name, values)

    return this
  }

  /**
   * Set a orWhere null statement in your query.
   */
  public orWhereNull(column: ModelColumns<M>) {
    const name = this.schema.getColumnNameByProperty(column)

    super.orWhereNull(name)

    return this
  }

  /**
   * Set a orWhere not null statement in your query.
   */
  public orWhereNotNull(column: ModelColumns<M>) {
    const name = this.schema.getColumnNameByProperty(column)

    super.orWhereNotNull(name)

    return this
  }

  /**
   * Set an order by statement in your query.
   */
  public orderBy(column: ModelColumns<M>, direction: Direction = 'ASC') {
    const name = this.schema.getColumnNameByProperty(column)

    super.orderBy(name, direction)

    return this
  }

  /**
   * Order the results easily by the latest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   */
  public latest(column?: ModelColumns<M>) {
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
  public oldest(column?: ModelColumns<M>) {
    if (!column) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      column = 'createdAt'
    }

    const name = this.schema.getColumnNameByProperty(column)

    super.oldest(name)

    return this
  }

  /**
   * Set the internal selected properties and soft delete
   * queries.
   */
  private setInternalQueries(options?: {
    addSelect?: boolean
    addSoftDelete?: boolean
  }) {
    options = Options.create(options, {
      addSelect: true,
      addSoftDelete: true
    })

    if (options.addSelect) {
      super.select(...this.selectColumns)
    }

    if (options.addSoftDelete) {
      super.when(this.isSoftDelete, query =>
        query.whereNull(this.DELETED_AT_NAME as any)
      )
    }
  }

  /**
   * Verify that columns with `isNullable` property
   * can be created in database.
   */
  private validateNullable(data: any) {
    if (!this.isToValidateNullable) {
      return
    }

    const records = []

    for (const column of this.schema.getAllNotNullableColumns()) {
      const value = data[column.name]

      if (value === undefined || value === null) {
        records.push(column.property)
      }
    }

    if (!Is.Empty(records)) {
      throw new NullableValueException(records)
    }
  }

  /**
   * Verify that columns with isUnique property
   * can be created in database.
   */
  private async validateUnique(data: any, isUpdate = false) {
    if (!this.isToValidateUnique) {
      return
    }

    const records = {}

    for (const column of this.schema.getAllUniqueColumns()) {
      const value = data[column.name]

      if (value === undefined) {
        continue
      }

      if (isUpdate) {
        const data = await this.Model.query()
          .where(column.name as never, value)
          .findMany()

        if (data.length > 1) {
          records[column.property] = value

          continue
        }
      }

      const isDuplicated = await this.Model.query()
        .where(column.name as never, value)
        .exists()

      if (isDuplicated) {
        records[column.property] = value
      }
    }

    if (!Is.Empty(records)) {
      throw new UniqueValueException(records)
    }
  }
}
