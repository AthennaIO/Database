/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  Is,
  Options,
  Collection,
  type Where,
  type FilterOptions,
  type PaginationOptions
} from '@athenna/common'

import type {
  Direction,
  Operations,
  ModelColumns,
  SearchOptions,
  ModelRelations,
  OrderByOptions,
  FullTextSearchOptions
} from '#src/types'

import { JsonOperation } from '#src/helpers/JsonOperation'

import type { BaseModel } from '#src/models/BaseModel'
import type { Driver } from '#src/database/drivers/Driver'
import { QueryBuilder } from '#src/database/builders/QueryBuilder'
import type { ModelSchema } from '#src/models/schemas/ModelSchema'
import { ModelGenerator } from '#src/models/factories/ModelGenerator'
import type { Transaction } from '#src/database/transactions/Transaction'
import { UniqueValueException } from '#src/exceptions/UniqueValueException'
import { HasOneRelation } from '#src/models/relations/HasOne/HasOneRelation'
import { NotFoundDataException } from '#src/exceptions/NotFoundDataException'
import { HasManyRelation } from '#src/models/relations/HasMany/HasManyRelation'
import { NullableValueException } from '#src/exceptions/NullableValueException'
import { BelongsToRelation } from '#src/models/relations/BelongsTo/BelongsToRelation'
import { BelongsToManyRelation } from '#src/models/relations/BelongsToMany/BelongsToManyRelation'
import { HasOneThroughRelation } from '#src/models/relations/HasOneThrough/HasOneThroughRelation'
import { HasManyThroughRelation } from '#src/models/relations/HasManyThrough/HasManyThroughRelation'

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
  private isToFireHooks: boolean = true
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

    if (deletedAtColumn) {
      this.isSoftDelete = true
      this.DELETED_AT_NAME = deletedAtColumn.name
      this.DELETED_AT_PROP = deletedAtColumn.property
    }

    this.selectColumns = this.schema.getAllColumnNames()
    this.setPrimaryKey(this.primaryKeyName)
  }

  /**
   * Define a transaction to be used by the model query builder.
   */
  public setTransaction(trx: Transaction) {
    return this.setDriver(trx.driver, this.Model.table())
  }

  /**
   * Set a different driver to the model query builder.
   */
  public setDriver(driver: Driver, tableName?: string) {
    super.setDriver(driver, tableName)

    return this
  }

  /**
   * Calculate the average of a given column.
   */
  public async avg(column: ModelColumns<M>): Promise<number> {
    this.setInternalQueries()

    const name = this.schema.getColumnNameByProperty(column)

    return super.avg(name as any)
  }

  /**
   * Calculate the average of a given column.
   */
  public async avgDistinct(column: ModelColumns<M>): Promise<number> {
    this.setInternalQueries()

    const name = this.schema.getColumnNameByProperty(column)

    return super.avgDistinct(name as any)
  }

  /**
   * Get the max number of a given column.
   */
  public async max(column: ModelColumns<M>): Promise<number> {
    this.setInternalQueries()

    const name = this.schema.getColumnNameByProperty(column)

    return super.max(name as any)
  }

  /**
   * Get the min number of a given column.
   */
  public async min(column: ModelColumns<M>): Promise<number> {
    this.setInternalQueries()

    const name = this.schema.getColumnNameByProperty(column)

    return super.min(name as any)
  }

  /**
   * Sum all numbers of a given column.
   */
  public async sum(column: ModelColumns<M>): Promise<number> {
    this.setInternalQueries()

    const name = this.schema.getColumnNameByProperty(column)

    return super.sum(name as any)
  }

  /**
   * Sum all numbers of a given column.
   */
  public async sumDistinct(column: ModelColumns<M>): Promise<number> {
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
  public async count(column?: ModelColumns<M>): Promise<number> {
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
  public async countDistinct(column: ModelColumns<M>): Promise<number> {
    this.setInternalQueries()

    const name = this.schema.getColumnNameByProperty(column)

    return super.countDistinct(name as any)
  }

  /**
   * Find value in database but returns only the value of
   * selected column directly.
   */
  public async pluck<K extends Extract<ModelColumns<M>, keyof M>>(
    column: K
  ): Promise<M[K]>

  public async pluck(column: ModelColumns<M>): Promise<any>

  public async pluck(column: any): Promise<any> {
    this.setInternalQueries()

    const columnName: any = this.schema.getColumnNameByProperty(column as any)

    return super.pluck(columnName)
  }

  /**
   * Find many values in database but returns only the
   * values of selected column directly.
   */
  public async pluckMany<K extends Extract<ModelColumns<M>, keyof M>>(
    column: K
  ): Promise<M[K][]>

  public async pluckMany(column: ModelColumns<M>): Promise<any[]>

  public async pluckMany(column: any): Promise<any[]> {
    this.setInternalQueries()

    const columnName: any = this.schema.getColumnNameByProperty(column as any)

    return super.pluckMany(columnName)
  }

  /**
   * Disable firing the model lifecycle hooks for this query
   * instance. Used internally by the instance operations
   * (`model.save()`, `model.delete()`), which fire the hooks
   * themselves with the model instance as payload.
   */
  public withoutHooks() {
    this.isToFireHooks = false

    return this
  }

  /**
   * Find a value in database.
   */
  public async find() {
    if (this.isToFireHooks) {
      await this.schema.fireHooks('beforeFind', this)
    }

    this.setInternalQueries()

    const data = await super.find()

    this.resetCustomSelect()

    if (this.hasCustomSelect) {
      return data
    }

    const model = await this.generator.generateOne(data)

    if (model && this.isToFireHooks) {
      await this.schema.fireHooks('afterFind', model)
    }

    return model
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
   * Find a value in database or create a new one if it doesn't exist.
   */
  public async findOrCreate(data: Partial<M> = {}) {
    const hasValue = await this.find()

    if (hasValue) {
      return hasValue
    }

    return this.create(data)
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
   * Find a value in database and return as boolean.
   */
  public async exists() {
    this.setInternalQueries()

    return super.exists()
  }

  /**
   * Find many values in database.
   */
  public async findMany() {
    if (this.isToFireHooks) {
      await this.schema.fireHooks('beforeFind', this)
    }

    this.setInternalQueries()

    const data = await super.findMany()

    this.resetCustomSelect()

    if (this.hasCustomSelect) {
      return data
    }

    const models = await this.generator.generateMany(data)

    if (this.isToFireHooks) {
      for (const model of models) {
        await this.schema.fireHooks('afterFind', model)
      }
    }

    return models
  }

  /**
   * Find many values in database and return paginated.
   */
  public async paginate(
    page: PaginationOptions | number = { page: 0, limit: 10, resourceUrl: '/' },
    limit = 10,
    resourceUrl = '/'
  ) {
    if (this.isToFireHooks) {
      await this.schema.fireHooks('beforeFind', this)
    }

    this.setInternalQueries()

    const data = await super.paginate(page, limit, resourceUrl)

    this.resetCustomSelect()

    if (this.hasCustomSelect) {
      return data
    }

    data.data = await this.generator.generateMany(data.data)

    if (this.isToFireHooks) {
      for (const model of data.data) {
        await this.schema.fireHooks('afterFind', model)
      }
    }

    return data
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
    if (this.isToFireHooks) {
      for (const d of data) {
        await this.schema.fireHooks('beforeSave', d)
        await this.schema.fireHooks('beforeCreate', d)
      }
    }

    data = await Promise.all(
      data.map(async d => {
        const parsed = this.toPersistColumns(d, cleanPersist)

        this.validateNullable(parsed)
        await this.validateUnique(parsed)

        return parsed
      })
    )

    const created = await super.createMany(data)
    const models = await this.generator.generateMany(created)

    if (this.isToFireHooks) {
      for (const model of models) {
        await this.schema.fireHooks('afterCreate', model)
        await this.schema.fireHooks('afterSave', model)
      }
    }

    return models
  }

  /**
   * Map model properties to columns and stamp the timestamp columns, without
   * running the (race-prone) unique pre-check. Used by the conflict-aware
   * persistence methods that rely on the database to enforce uniqueness.
   */
  private toPersistColumns(data: Partial<M>, cleanPersist = true) {
    const date = new Date()
    const createdAt = this.schema.getCreatedAtColumn()
    const updatedAt = this.schema.getUpdatedAtColumn()
    const deletedAt = this.schema.getDeletedAtColumn()
    const attributes = this.isToSetAttributes ? this.Model.attributes() : {}

    const parsed = this.schema.propertiesToColumnNames(data, {
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

    return parsed
  }

  /**
   * Create or update a value in database.
   */
  public async createOrUpdate(data: Partial<M>, cleanPersist = true) {
    const hasValue = await this.find()

    if (hasValue) {
      const pk = this.primaryKeyProperty

      return this.where(pk, hasValue[pk as any]).update(
        data,
        cleanPersist
      ) as Promise<M>
    }

    return this.create(data, cleanPersist)
  }

  /**
   * Create a value, doing nothing if it would violate a unique constraint
   * (`ON CONFLICT DO NOTHING`/`INSERT IGNORE`). The current query's where
   * clauses detect the conflict. Returns the created model, or `null` when a
   * matching row already exists. Relies on the database constraint instead of
   * the race-prone model unique pre-check.
   */
  public async createOrIgnore(data: Partial<M> = {}, cleanPersist = true) {
    if (this.isToFireHooks) {
      await this.schema.fireHooks('beforeSave', data)
      await this.schema.fireHooks('beforeCreate', data)
    }

    this.setInternalQueries()

    const parsed = this.toPersistColumns(data, cleanPersist)

    this.validateNullable(parsed)

    const created = await super.createOrIgnore(parsed)

    if (!created) {
      return null
    }

    const model = await this.generator.generateOne(created)

    if (this.isToFireHooks) {
      await this.schema.fireHooks('afterCreate', model)
      await this.schema.fireHooks('afterSave', model)
    }

    return model
  }

  /**
   * Find the first value matching the current query or create it, never
   * throwing on a concurrent unique violation. Always returns a model.
   *
   * Since the driver can't tell apart a created row from a concurrently
   * found one, the `afterCreate`/`afterSave` hooks always fire with the
   * returned model, even when it already existed.
   */
  public async createOrFirst(data: Partial<M> = {}, cleanPersist = true) {
    if (this.isToFireHooks) {
      await this.schema.fireHooks('beforeSave', data)
      await this.schema.fireHooks('beforeCreate', data)
    }

    this.setInternalQueries()

    const parsed = this.toPersistColumns(data, cleanPersist)

    this.validateNullable(parsed)

    const value = await super.createOrFirst(parsed)
    const model = await this.generator.generateOne(value)

    if (this.isToFireHooks) {
      await this.schema.fireHooks('afterCreate', model)
      await this.schema.fireHooks('afterSave', model)
    }

    return model
  }

  /**
   * Update a value in database.
   */
  public async update(data: Partial<M>, cleanPersist = true) {
    if (this.isToFireHooks) {
      await this.schema.fireHooks('beforeSave', data)
      await this.schema.fireHooks('beforeUpdate', data)
    }

    const updated = await this.rawUpdate(data, cleanPersist)

    if (this.isToFireHooks) {
      const models = (Is.Array(updated) ? updated : [updated]).filter(
        model => !!model
      )

      for (const model of models) {
        await this.schema.fireHooks('afterUpdate', model)
        await this.schema.fireHooks('afterSave', model)
      }
    }

    return updated
  }

  /**
   * Shallow merge `object` into the JSON `column` atomically: first
   * level keys replace the existing ones and everything else in the
   * column is kept. A `NULL` column is treated as `{}`. Sugar for
   * `update({ [column]: Database.jsonMerge(object) })`, so it goes
   * through the model hooks and returns the updated models like
   * `update()`.
   *
   * @example
   * ```ts
   * await Integration.query()
   *   .where('id', id)
   *   .mergeJson('metadata', { crawlFinished: true })
   * ```
   */
  public async mergeJson(column: ModelColumns<M>, object: Record<string, any>) {
    return this.update({ [column]: JsonOperation.merge(object) } as any)
  }

  /**
   * Increment the number at the JSON `selector` atomically. A
   * missing key or a `NULL` column counts as `0` and missing
   * parents are created. Sugar for
   * `update({ [column]: Database.jsonIncrement(path, by) })`, so it
   * goes through the model hooks and returns the updated models
   * like `update()`.
   *
   * @example
   * ```ts
   * await Integration.query()
   *   .where('id', id)
   *   .incrementJson('metadata->totalIndexedCount')
   * ```
   */
  public async incrementJson(selector: string, by = 1) {
    const parsed = JsonOperation.parseSelector(selector)

    if (!parsed) {
      throw new Error(`Invalid JSON selector: ${selector}`)
    }

    return this.update({
      [parsed.column]: JsonOperation.increment(parsed.path, by)
    } as any)
  }

  /**
   * Decrement the number at the JSON `selector` atomically. Same as
   * `incrementJson(selector, -by)`.
   */
  public async decrementJson(selector: string, by = 1) {
    return this.incrementJson(selector, -by)
  }

  /**
   * Update a value in database without firing the lifecycle hooks.
   * Used by the soft delete path, which must not masquerade as an
   * update to the hooks.
   */
  private async rawUpdate(data: Partial<M>, cleanPersist = true) {
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

    await this.validateUnique(parsed)

    const updated = await super.update(parsed)

    if (Is.Array(updated)) {
      return this.generator.generateMany(updated)
    }

    return this.generator.generateOne(updated)
  }

  /**
   * Delete or soft delete a value in database.
   *
   * Delete hooks are fired only by instance deletes (`model.delete()`),
   * where the model instance is known. Query deletes fire no hooks —
   * not even update hooks on the soft delete path.
   */
  public async delete(force = false): Promise<void> {
    this.setInternalQueries({ addSelect: false })

    if (!this.DELETED_AT_NAME || force) {
      await super.delete()

      return
    }

    await this.rawUpdate({ [this.DELETED_AT_PROP]: new Date() } as any)
  }

  /**
   * Restore one or multiple soft deleted models.
   */
  public async restore(data?: Partial<M>) {
    this.setInternalQueries({ addSoftDelete: false })

    if (!this.DELETED_AT_PROP) {
      return
    }

    const date = new Date()
    const updatedAt = this.schema.getUpdatedAtColumn()
    const attributes = this.isToSetAttributes ? this.Model.attributes() : {}

    const parsed = this.schema.propertiesToColumnNames(
      { ...data, [this.DELETED_AT_PROP]: null } as any,
      {
        attributes
      }
    )

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
   * Retrieve active and soft deleted values from database.
   */
  public withTrashed() {
    this.isSoftDelete = false

    return this
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
   * Only returns the data if the closure returns a result.
   */
  public whereHas<K extends ModelRelations<M>>(
    relation: K | string,
    closure?: (
      query: ModelQueryBuilder<
        Extract<M[K] extends BaseModel[] ? M[K][0] : M[K], BaseModel>,
        Driver
      >
    ) => any
  ) {
    const options = this.schema.includeWhereHasRelation(relation, closure)

    /**
     * Snapshot the full options object immediately at call time, before any
     * subsequent `with(sameRelation)` call can mutate the shared `options`
     * object (e.g. overwriting `closure` or `withClosure`).  Because this
     * spread happens here — outside the Knex callback — the snapshot is
     * frozen regardless of what happens to `options` afterwards.
     */
    const snapshot = { ...options }

    super.whereExists(query => {
      switch (snapshot.type) {
        case 'hasOne':
          return HasOneRelation.whereHas(this.Model, query, snapshot)
        case 'hasMany':
          return HasManyRelation.whereHas(this.Model, query, snapshot)
        case 'hasOneThrough':
          return HasOneThroughRelation.whereHas(this.Model, query, snapshot)
        case 'hasManyThrough':
          return HasManyThroughRelation.whereHas(this.Model, query, snapshot)
        case 'belongsTo':
          return BelongsToRelation.whereHas(this.Model, query, snapshot)
        case 'belongsToMany':
          return BelongsToManyRelation.whereHas(this.Model, query, snapshot)
      }
    })

    return this
  }

  /**
   * Same as {@link ModelQueryBuilder.whereHas}, but joins the resulting
   * `EXISTS (...)` clause to the surrounding WHERE with `OR` instead of `AND`.
   *
   * Useful inside a grouped `where(qb => ...)` closure to build expressions
   * like `(directCol ILIKE x OR relation.col ILIKE x)` without resorting to
   * raw SQL.
   */
  public orWhereHas<K extends ModelRelations<M>>(
    relation: K | string,
    closure?: (
      query: ModelQueryBuilder<
        Extract<M[K] extends BaseModel[] ? M[K][0] : M[K], BaseModel>,
        Driver
      >
    ) => any
  ) {
    const options = this.schema.includeWhereHasRelation(relation, closure)

    /**
     * Snapshot the full options object immediately at call time, before any
     * subsequent `with(sameRelation)` call can mutate the shared `options`
     * object (e.g. overwriting `closure` or `withClosure`).  Because this
     * spread happens here — outside the Knex callback — the snapshot is
     * frozen regardless of what happens to `options` afterwards.
     */
    const snapshot = { ...options }

    super.orWhereExists(query => {
      switch (snapshot.type) {
        case 'hasOne':
          return HasOneRelation.whereHas(this.Model, query, snapshot)
        case 'hasMany':
          return HasManyRelation.whereHas(this.Model, query, snapshot)
        case 'hasOneThrough':
          return HasOneThroughRelation.whereHas(this.Model, query, snapshot)
        case 'hasManyThrough':
          return HasManyThroughRelation.whereHas(this.Model, query, snapshot)
        case 'belongsTo':
          return BelongsToRelation.whereHas(this.Model, query, snapshot)
        case 'belongsToMany':
          return BelongsToManyRelation.whereHas(this.Model, query, snapshot)
      }
    })

    return this
  }

  /**
   * Build a grouped OR search across any mix of direct columns,
   * JSON paths and relation columns in a single `WHERE (...)`
   * clause using `ILIKE '%term%'`.
   *
   * Each entry in `fields` is a column property (`name`), a JSON
   * path (`metadata->title`) or a `relation.column` path
   * (`profile.bio`, `orders.product.name` for nested relations),
   * which is applied inside a `whereHas()`. The resulting SQL is a
   * single parenthesized group joined exclusively by `OR`. Passing
   * a falsy `term` short-circuits and the query is left untouched.
   *
   * `options.unaccent` wraps both sides in `unaccent()` so accents
   * are ignored. Only Postgres supports it and it requires the
   * `unaccent` extension. Other drivers ignore the option.
   *
   * @example
   * ```ts
   * User.query().search(['name', 'email', 'metadata->title', 'profile.bio'], 'john')
   * User.query().search(['name'], 'joao', { unaccent: true })
   * ```
   */
  public search(
    fields: (ModelColumns<M> | ModelRelations<M> | string)[],
    term: string,
    options: SearchOptions = {}
  ) {
    if (!term) {
      return this
    }

    const value = `%${term}%`

    this.where(qb => {
      fields.forEach((field, i) => {
        const isFirst = i === 0
        const relations = (field as string).split('.')
        const column = relations.pop()

        if (!relations.length) {
          const op = isFirst ? 'whereILike' : 'orWhereILike'

          ;(qb as any)[op](column, value, options)

          return
        }

        const op = isFirst ? 'whereHas' : 'orWhereHas'

        this.applyInRelation(qb, op, relations, (query: any) =>
          query.whereILike(column, value, options)
        )
      })
    })

    return this
  }

  /**
   * Apply the same `where`, `orderBy`, `select` and `includes`
   * filters that a client sends in the query string, usually
   * parsed and authorized by `request.filters()` from
   * `@athenna/http`. Nothing is validated here: only pass filters
   * that were already allowed.
   *
   * - `where`: filters are grouped by field and filters on the
   *   same field are combined with `AND`. `=` and `!=` with `null`
   *   become `whereNull`/`whereNotNull`, `contains`/`not_contains`
   *   become `ILIKE '%value%'`/`NOT ILIKE`, `relation.column`
   *   paths (any depth) are applied inside `whereHas()` and
   *   `column->key` paths use `whereJson()`.
   * - `orderBy`: applied in order, JSON paths supported.
   * - `select`: the columns to select, empty is a no-op.
   * - `includes`: the relations to eager load.
   * - `page` and `limit` are ignored, call `paginate()` yourself.
   * - `search` is ignored, call `search()` with the fields to look
   *   into yourself.
   *
   * @example
   * ```ts
   * const filters = request.filters({ where: ['status', 'avatar.name'] })
   *
   * VoiceClone.query()
   *   .search(filters.search, ['name', 'avatar.name'])
   *   .filter(filters)
   *   .paginate({ page: filters.page, limit: filters.limit })
   * ```
   */
  public filter(options: Partial<FilterOptions> = {}) {
    if (options.select?.length) {
      this.select(...(options.select as ModelColumns<M>[]))
    }

    options.includes?.forEach(include => this.with(include))

    if (options.where?.length) {
      this.applyWhereFilters(options.where)
    }

    options.orderBy?.forEach(({ field, direction }) =>
      this.orderBy(field as ModelColumns<M>, direction)
    )

    return this
  }

  /**
   * Group the where filters by field and apply each group, chaining
   * `whereHas()` for `relation.column` fields.
   */
  private applyWhereFilters(where: Where[]) {
    const groups = new Map<string, Where[]>()

    where.forEach(filter => {
      groups.set(filter.field, [...(groups.get(filter.field) || []), filter])
    })

    groups.forEach((filters, field) => {
      const relations = field.split('.')
      const column = relations.pop()

      if (!relations.length) {
        this.where(qb => this.applyWhereFiltersInColumn(qb, column, filters))

        return
      }

      this.applyInRelation(this, 'whereHas', relations, (query: any) =>
        query.where((qb: any) =>
          this.applyWhereFiltersInColumn(qb, column, filters)
        )
      )
    })
  }

  /**
   * Chain `whereHas()`/`orWhereHas()` through the relation path and
   * run the closure in the innermost query.
   */
  private applyInRelation(
    query: any,
    method: 'whereHas' | 'orWhereHas',
    relations: string[],
    closure: (query: any) => any
  ) {
    const [relation, ...rest] = relations

    query[method](relation, (nested: any) => {
      if (!rest.length) {
        closure(nested)

        return
      }

      this.applyInRelation(nested, 'whereHas', rest, closure)
    })
  }

  /**
   * Apply the filters of a single column. Filters on the same
   * column are chained, so they are combined with `AND`. JSON
   * paths go through `whereJson()`, which supports every operator
   * of the DSL, and plain columns through the dedicated `where*()`.
   */
  private applyWhereFiltersInColumn(
    query: any,
    column: string,
    filters: Where[]
  ) {
    const isJson = column.includes('->')

    const where = (operator: string, value: any) => {
      if (isJson) {
        return query.whereJson(column, operator, value)
      }

      switch (operator) {
        case 'in':
          return query.whereIn(column, value)
        case 'not in':
          return query.whereNotIn(column, value)
        case 'between':
          return query.whereBetween(column, value)
        case 'not between':
          return query.whereNotBetween(column, value)
        case 'not ilike':
          return query.whereNot((qb: any) => qb.whereILike(column, value))
        default:
          return query.where(column, operator, value)
      }
    }

    filters.forEach(({ op, value }) => {
      switch (op) {
        case '=':
          if (Is.Null(value)) {
            return isJson
              ? query.whereJsonNull(column)
              : query.whereNull(column)
          }

          return where('=', value)
        case '!=':
          if (Is.Null(value)) {
            return isJson
              ? query.whereJsonNotNull(column)
              : query.whereNotNull(column)
          }

          return where('<>', value)
        case '>':
        case '>=':
        case '<':
        case '<=':
          return where(op, value)
        case 'in':
          return where('in', value)
        case 'not_in':
          return where('not in', value)
        case 'between':
          return where('between', value)
        case 'not_between':
          return where('not between', value)
        case 'contains':
          return query.whereILike(column, `%${value}%`)
        case 'not_contains':
          return where('not ilike', `%${value}%`)
      }
    })
  }

  /**
   * Same as `search()` but using the full text search engine of
   * your database instead of `LIKE`, see `whereFullText()`.
   *
   * Direct columns are grouped in a single `whereFullText()` call
   * and `relation.column` paths are grouped per relation inside a
   * `whereHas()`, all joined by `OR` in a single `WHERE (...)`. The
   * grouping matters for MySQL, where the set of columns must match
   * a FULLTEXT index. Passing a falsy `term` short-circuits and the
   * query is left untouched.
   *
   * @example
   * ```ts
   * User.query().fullTextSearch(['name', 'email', 'profile.bio'], 'john')
   * ```
   */
  public fullTextSearch(
    fields: (ModelColumns<M> | ModelRelations<M> | string)[],
    term: string,
    options?: FullTextSearchOptions
  ) {
    if (!term) {
      return this
    }

    const columns: string[] = []
    const relations = new Map<string, string[]>()

    fields.forEach(field => {
      const [relation, column] = (field as string).split('.')

      if (!column) {
        columns.push(relation)

        return
      }

      relations.set(relation, [...(relations.get(relation) || []), column])
    })

    this.where(qb => {
      let isFirst = true

      if (columns.length) {
        ;(qb as any).whereFullText(columns, term, options)

        isFirst = false
      }

      relations.forEach((relationColumns, relation) => {
        const op = isFirst ? 'whereHas' : 'orWhereHas'

        ;(qb as any)[op](relation, (q: any) =>
          q.whereFullText(relationColumns, term, options)
        )

        isFirst = false
      })
    })

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
    const selectColumns = this.schema.getColumnNamesByProperties(columns)

    super.select(...selectColumns)
    this.hasCustomSelect = true

    return this
  }

  /**
   * Set the columns that should be selected on query raw.
   */
  public selectRaw(sql: string, bindings?: any) {
    super.selectRaw(sql, bindings)
    this.hasCustomSelect = true

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

  public where(statement: (query: this) => void): this
  public where(statement: Partial<M>): this
  public where(statement: Record<string, any>): this
  public where(key: ModelColumns<M>, value: any): this
  public where(key: ModelColumns<M>, operation: Operations, value: any): this

  /**
   * Set a where statement in your query.
   */
  public where(statement: any, operation?: any | Operations, value?: any) {
    if (Is.Function(statement)) {
      super.where(query => {
        statement(new ModelQueryBuilder(this.Model, query as unknown as Driver))
      })

      return this
    }

    if (!Is.String(statement) && Is.Undefined(operation)) {
      const parsed = this.schema.propertiesToColumnNames(statement)

      super.where(parsed)

      return this
    }

    const name = this.schema.getColumnNameByProperty(statement)

    super.where(name, operation, value)

    return this
  }

  public whereNot(statement: (query: this) => void): this
  public whereNot(statement: Partial<M>): this
  public whereNot(statement: Record<string, any>): this
  public whereNot(key: ModelColumns<M>, value: any): this

  /**
   * Set a where not statement in your query.
   */
  public whereNot(statement: any, value?: any) {
    if (Is.Function(statement)) {
      super.whereNot(query => {
        statement(new ModelQueryBuilder(this.Model, query as unknown as Driver))
      })

      return this
    }

    if (!Is.String(statement) && Is.Undefined(value)) {
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
  public whereILike(
    column: ModelColumns<M>,
    value: any,
    options?: SearchOptions
  ) {
    const name = this.getSelectorColumnName(column)

    super.whereILike(name, value, options)

    return this
  }

  /**
   * Get the column name of a property that may be a JSON selector,
   * e.g. `metadata->title` maps only the `metadata` part.
   */
  private getSelectorColumnName(property: ModelColumns<M> | string) {
    const parsed = JsonOperation.parseSelector(property as string)

    if (!parsed) {
      return this.schema.getColumnNameByProperty(property)
    }

    return `${this.schema.getColumnNameByProperty(parsed.column)}->${
      parsed.path
    }`
  }

  /**
   * Set a where full text search statement in your query. The
   * statement is dialect specific and relies on an index that
   * YOU must create in your migrations, see each driver for the
   * exact requirements.
   */
  public whereFullText(
    columns: ModelColumns<M> | ModelColumns<M>[],
    value: string,
    options?: FullTextSearchOptions
  ) {
    const names = this.schema.getColumnNamesByProperties(
      Is.Array(columns) ? columns : [columns]
    )

    super.whereFullText(names, value, options)

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

  public whereJson(column: ModelColumns<M>, value: any): this
  public whereJson(
    column: ModelColumns<M>,
    operation: Operations,
    value: any
  ): this

  /**
   * Set a where json statement in your query.
   */
  public whereJson(column: ModelColumns<M>, operation: any, value?: any) {
    const name = this.getSelectorColumnName(column)

    super.whereJson(name, operation, value)

    return this
  }

  /**
   * Set a where json null statement in your query. Matches when
   * the key is missing or its value is `null`.
   *
   * @example
   * ```ts
   * Avatar.query().whereJsonNull('metadata->videoAiFreeUsed')
   * ```
   */
  public whereJsonNull(column: ModelColumns<M> | string) {
    super.whereJsonNull(this.getSelectorColumnName(column))

    return this
  }

  /**
   * Set a where json not null statement in your query. Matches
   * when the key exists and its value is not `null`.
   */
  public whereJsonNotNull(column: ModelColumns<M> | string) {
    super.whereJsonNotNull(this.getSelectorColumnName(column))

    return this
  }

  public orWhere(statement: (query: this) => void): this
  public orWhere(statement: Partial<M>): this
  public orWhere(statement: Record<string, any>): this
  public orWhere(key: ModelColumns<M>, value: any): this
  public orWhere(key: ModelColumns<M>, operation: Operations, value: any): this

  /**
   * Set a orWhere statement in your query.
   */
  public orWhere(statement: any, operation?: any | Operations, value?: any) {
    if (Is.Function(statement)) {
      super.orWhere(query => {
        statement(new ModelQueryBuilder(this.Model, query as unknown as Driver))
      })

      return this
    }

    if (!Is.String(statement) && Is.Undefined(operation)) {
      const parsed = this.schema.propertiesToColumnNames(statement)

      super.orWhere(parsed)

      return this
    }

    const name = this.schema.getColumnNameByProperty(statement)

    super.orWhere(name, operation, value)

    return this
  }

  public orWhereNot(statement: (query: this) => void): this
  public orWhereNot(statement: Partial<M>): this
  public orWhereNot(statement: Record<string, any>): this
  public orWhereNot(key: ModelColumns<M>, value: any): this

  /**
   * Set a orWhere not statement in your query.
   */
  public orWhereNot(statement: any, value?: any) {
    if (Is.Function(statement)) {
      super.orWhereNot(query => {
        statement(new ModelQueryBuilder(this.Model, query as unknown as Driver))
      })

      return this
    }

    if (!Is.String(statement) && Is.Undefined(value)) {
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
    if (!Is.String(statement) && Is.Undefined(value)) {
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
  public orWhereILike(
    key: ModelColumns<M>,
    value: any,
    options?: SearchOptions
  ): this

  /**
   * Set a orWhere ILike statement in your query.
   */
  public orWhereILike(statement: any, value?: any, options?: SearchOptions) {
    if (!Is.String(statement) && Is.Undefined(value)) {
      const parsed = this.schema.propertiesToColumnNames(statement)

      super.orWhereILike(parsed)

      return this
    }

    const name = this.getSelectorColumnName(statement)

    super.orWhereILike(name, value, options)

    return this
  }

  /**
   * Set an or where full text search statement in your query.
   * Same requirements of `whereFullText()`.
   */
  public orWhereFullText(
    columns: ModelColumns<M> | ModelColumns<M>[],
    value: string,
    options?: FullTextSearchOptions
  ) {
    const names = this.schema.getColumnNamesByProperties(
      Is.Array(columns) ? columns : [columns]
    )

    super.orWhereFullText(names, value, options)

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

  public orWhereJson(column: ModelColumns<M>, value: any): this
  public orWhereJson(
    column: ModelColumns<M>,
    operation: Operations,
    value: any
  ): this

  /**
   * Set an orWhereJson statement in your query.
   */
  public orWhereJson(
    column: ModelColumns<M>,
    operation: Operations,
    value?: any
  ) {
    const name = this.getSelectorColumnName(column)

    super.orWhereJson(name, operation, value)

    return this
  }

  /**
   * Set an or where json null statement in your query.
   */
  public orWhereJsonNull(column: ModelColumns<M> | string) {
    super.orWhereJsonNull(this.getSelectorColumnName(column))

    return this
  }

  /**
   * Set an or where json not null statement in your query.
   */
  public orWhereJsonNotNull(column: ModelColumns<M> | string) {
    super.orWhereJsonNotNull(this.getSelectorColumnName(column))

    return this
  }

  /**
   * Set an order by statement in your query.
   */
  public orderBy(
    column: ModelColumns<M> | string,
    direction: Direction = 'ASC',
    options?: OrderByOptions
  ) {
    const name = this.getSelectorColumnName(column)

    super.orderBy(name, direction, options)

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

    if (options.addSelect && !this.hasCustomSelect) {
      super.select(...this.selectColumns)
    }

    if (options.addSoftDelete) {
      super.when(this.isSoftDelete, query =>
        query.whereNull(this.DELETED_AT_NAME as any)
      )
    }
  }

  /**
   * Reset select state after terminal custom select queries.
   */
  private resetCustomSelect() {
    if (!this.hasCustomSelect) {
      return
    }

    this.hasCustomSelect = false
    this.selectColumns = this.schema.getAllColumnNames()
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
   *
   * One `exists()` per unique column, all running concurrently.
   * The old update path (`findMany().length > 1`, falling through
   * to `exists()`) flagged a conflict in exactly the same cases —
   * whenever the value exists in any row — while also hydrating
   * full models for nothing.
   */
  private async validateUnique(data: any) {
    if (!this.isToValidateUnique) {
      return
    }

    const records = {}
    const columns = this.schema
      .getAllUniqueColumns()
      .filter(
        column =>
          data[column.name] !== undefined &&
          !JsonOperation.is(data[column.name])
      )

    await Promise.all(
      columns.map(async column => {
        const value = data[column.name]

        const isDuplicated = await this.Model.query()
          .withoutHooks()
          .where(column.name as never, value)
          .exists()

        if (isDuplicated) {
          records[column.property] = value
        }
      })
    )

    if (!Is.Empty(records)) {
      throw new UniqueValueException(records)
    }
  }
}
