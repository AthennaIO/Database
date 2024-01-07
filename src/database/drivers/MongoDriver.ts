/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  Exec,
  Is,
  Json,
  Options,
  type PaginatedResponse
} from '@athenna/common'

import { debug } from '#src/debug'
import { Driver } from '#src/database/drivers/Driver'
import { DriverFactory } from '#src/factories/DriverFactory'
import { ModelSchema } from '#src/models/schemas/ModelSchema'
import { Transaction } from '#src/database/transactions/Transaction'
import { ConnectionFactory } from '#src/factories/ConnectionFactory'
import type { Connection, Collection, ClientSession } from 'mongoose'
import type { ConnectionOptions, Direction, Operations } from '#src/types'
import { WrongMethodException } from '#src/exceptions/WrongMethodException'
import { MONGO_OPERATIONS_DICTIONARY } from '#src/constants/MongoOperationsDictionary'
import { NotConnectedDatabaseException } from '#src/exceptions/NotConnectedDatabaseException'
import { NotImplementedMethodException } from '#src/exceptions/NotImplementedMethodException'

export class MongoDriver extends Driver<Connection, Collection> {
  public primaryKey = '_id'
  public session: ClientSession = null

  /**
   * The where clause used in update queries.
   */
  private _where: Record<string, any>[] = []

  /**
   * The or where clause used in update queries.
   */
  private _orWhere: Record<string, any>[] = []

  /**
   * The aggregate pipeline to make mongo queries.
   */
  private pipeline: any[] = []

  /**
   * Set the mongo session that should be used by the driver.
   */
  public setSession(session: ClientSession) {
    this.session = session

    return this
  }

  /**
   * Connect to database.
   */
  public connect(options: ConnectionOptions = {}): void {
    options = Options.create(options, {
      force: false,
      saveOnFactory: true,
      connect: true
    })

    if (!options.connect) {
      return
    }

    if (this.isConnected && !options.force) {
      return
    }

    this.client = ConnectionFactory.mongo(this.connection)

    if (options.saveOnFactory) {
      DriverFactory.setClient('mongo', this.client)
    }

    this.isConnected = true
    this.isSavedOnFactory = options.saveOnFactory

    this.qb = this.query()
  }

  /**
   * Close the connection with database in this instance.
   */
  public async close(): Promise<void> {
    if (!this.isConnected) {
      return
    }

    if (this.isSavedOnFactory && DriverFactory.hasClient('mongo')) {
      await DriverFactory.getClient('mongo').close()
      DriverFactory.setClient('mongo', null)
    } else {
      await this.client.close()
    }

    this.qb = null
    this.tableName = null
    this.client = null
    this.session = null
    this.isConnected = false
  }

  /**
   * Creates a new instance of query builder.
   */
  public query(): Collection {
    if (!this.isConnected) {
      throw new NotConnectedDatabaseException()
    }

    return this.client.collection(this.tableName || 'lock')
  }

  /**
   * Sync a model schema with database.
   */
  public async sync(schema: ModelSchema): Promise<void> {
    const columns: any = {}
    const mongoose = await import('mongoose')

    schema.columns.forEach(column => {
      columns[column.name] = {}

      if (column.type !== undefined) {
        columns[column.name].type = column.type
      }

      if (column.isNullable !== undefined) {
        columns[column.name].required = column.isNullable
      }

      if (column.length !== undefined) {
        columns[column.name].maxLength = column.length
      }

      if (column.defaultTo !== undefined) {
        columns[column.name].default = column.defaultTo
      }

      if (column.isIndex !== undefined) {
        columns[column.name].index = column.isIndex
      }

      if (column.isSparse !== undefined) {
        columns[column.name].sparse = column.isSparse
      }

      if (column.isUnique !== undefined) {
        columns[column.name].unique = column.isUnique
      }

      if (columns[column.name].unique || columns[column.name].sparse) {
        columns[column.name].index = true
      }
    })

    /**
     * Relations will not be registered because
     * Athenna will handle them instead of mongoose.
     */
    this.client
      .model(schema.getModelName(), new mongoose.Schema(columns))
      .syncIndexes()
  }

  /**
   * Create a new transaction.
   */
  public async startTransaction(): Promise<
    Transaction<Connection, Collection>
  > {
    const session = await this.client.startSession()

    session.startTransaction()

    return new Transaction(
      new MongoDriver(this.connection, this.client).setSession(session)
    )
  }

  /**
   * Commit the transaction.
   */
  public async commitTransaction(): Promise<void> {
    await this.session.commitTransaction()
    await this.session.endSession()

    this.tableName = null
    this.client = null
    this.session = null
    this.isConnected = false
  }

  /**
   * Rollback the transaction.
   */
  public async rollbackTransaction(): Promise<void> {
    await this.session.abortTransaction()
    await this.session.endSession()

    this.tableName = null
    this.client = null
    this.session = null
    this.isConnected = false
  }

  /**
   * Run database migrations.
   */
  public async runMigrations(): Promise<void> {
    throw new NotImplementedMethodException(this.runMigrations.name, 'mongo')
  }

  /**
   * Revert database migrations.
   */
  public async revertMigrations(): Promise<void> {
    throw new NotImplementedMethodException(this.revertMigrations.name, 'mongo')
  }

  /**
   * List all databases available.
   */
  public async getDatabases(): Promise<string[]> {
    const admin = this.client.db.admin()
    const { databases } = await admin.listDatabases()

    return databases.map(database => database.name)
  }

  /**
   * Get the current database name.
   */
  public async getCurrentDatabase(): Promise<string | undefined> {
    return this.client.db.databaseName
  }

  /**
   * Verify if database exists.
   */
  public async hasDatabase(database: string): Promise<boolean> {
    const databases = await this.getDatabases()

    return databases.includes(database)
  }

  /**
   * Create a new database.
   */
  public async createDatabase(): Promise<void> {
    throw new NotImplementedMethodException(this.createDatabase.name, 'mongo')
  }

  /**
   * Drop some database.
   */
  public async dropDatabase(database: string): Promise<void> {
    await this.client.useDb(database).dropDatabase()
  }

  /**
   * List all tables available.
   */
  public async getTables(): Promise<string[]> {
    const collections = await this.client.db.listCollections().toArray()

    return collections.map(collection => collection.name)
  }

  /**
   * Verify if table exists.
   */
  public async hasTable(table: string): Promise<boolean> {
    const tables = await this.getTables()

    return tables.includes(table)
  }

  /**
   * Create a new table in database.
   */
  public async createTable(): Promise<void> {
    throw new NotImplementedMethodException(this.createTable.name, 'mongo')
  }

  /**
   * Drop a table in database.
   */
  public async dropTable(table: string): Promise<void> {
    try {
      await this.client.dropCollection(table)
    } catch (err) {
      debug('error happened while dropping table %s in MongoDriver: %o', err)
    }
  }

  /**
   * Remove all data inside some database table
   * and restart the identity of the table.
   */
  public async truncate(table: string): Promise<void> {
    const collection = this.client.collection(table)

    await collection.deleteMany({}, { session: this.session })
  }

  /**
   * Make a raw query in database.
   */
  public raw<T = any>(): T {
    throw new NotImplementedMethodException(this.raw.name, 'mongo')
  }

  /**
   * Calculate the average of a given column.
   */
  public async avg(column: string): Promise<string> {
    const pipeline = this.createPipeline()

    pipeline.push({
      $group: { [this.primaryKey]: null, avg: { $avg: `$${column}` } }
    })
    pipeline.push({ $project: { [this.primaryKey]: 0, avg: 1 } })

    const result = await this.qb
      .aggregate(pipeline, { session: this.session })
      .toArray()

    if (Is.Empty(result)) {
      return null
    }

    return `${result[0].avg}`
  }

  /**
   * Calculate the average of a given column using distinct.
   */
  public async avgDistinct(column: string): Promise<string> {
    const pipeline = this.createPipeline()

    pipeline.push({
      $group: { [this.primaryKey]: null, set: { $addToSet: `$${column}` } }
    })
    pipeline.push({ $project: { [this.primaryKey]: 0, avg: { $avg: '$set' } } })

    const result = await this.qb
      .aggregate(pipeline, { session: this.session })
      .toArray()

    if (Is.Empty(result)) {
      return null
    }

    return `${result[0].avg}`
  }

  /**
   * Get the max number of a given column.
   */
  public async max(column: string): Promise<string> {
    const pipeline = this.createPipeline()

    pipeline.push({
      $group: { [this.primaryKey]: null, max: { $max: `$${column}` } }
    })
    pipeline.push({ $project: { [this.primaryKey]: 0, max: 1 } })

    const result = await this.qb
      .aggregate(pipeline, { session: this.session })
      .toArray()

    if (Is.Empty(result)) {
      return null
    }

    return `${result[0].max}`
  }

  /**
   * Get the min number of a given column.
   */
  public async min(column: string): Promise<string> {
    const pipeline = this.createPipeline()

    pipeline.push({
      $group: { [this.primaryKey]: null, min: { $min: `$${column}` } }
    })
    pipeline.push({ $project: { [this.primaryKey]: 0, min: 1 } })

    const result = await this.qb
      .aggregate(pipeline, { session: this.session })
      .toArray()

    if (Is.Empty(result)) {
      return null
    }

    return `${result[0].min}`
  }

  /**
   * Sum all numbers of a given column.
   */
  public async sum(column: string): Promise<string> {
    const pipeline = this.createPipeline()

    pipeline.push({
      $group: { [this.primaryKey]: null, sum: { $sum: `$${column}` } }
    })
    pipeline.push({ $project: { [this.primaryKey]: 0, sum: 1 } })

    const result = await this.qb
      .aggregate(pipeline, { session: this.session })
      .toArray()

    if (Is.Empty(result)) {
      return null
    }

    return `${result[0].sum}`
  }

  /**
   * Sum all numbers of a given column in distinct mode.
   */
  public async sumDistinct(column: string): Promise<string> {
    const pipeline = this.createPipeline()

    pipeline.push({
      $group: { [this.primaryKey]: null, set: { $addToSet: `$${column}` } }
    })
    pipeline.push({ $project: { [this.primaryKey]: 0, sum: { $sum: '$set' } } })

    const result = await this.qb
      .aggregate(pipeline, { session: this.session })
      .toArray()

    if (Is.Empty(result)) {
      return null
    }

    return `${result[0].sum}`
  }

  /**
   * Increment a value of a given column.
   */
  public async increment(column: string): Promise<void> {
    const where = this.createWhere()

    await this.qb.updateMany(
      where,
      { $inc: { [column]: 1 } },
      { session: this.session, upsert: false }
    )
  }

  /**
   * Decrement a value of a given column.
   */
  public async decrement(column: string): Promise<void> {
    const where = this.createWhere()

    await this.qb.updateMany(
      where,
      { $inc: { [column]: -1 } },
      { session: this.session, upsert: false }
    )
  }

  /**
   * Calculate the average of a given column using distinct.
   */
  public async count(column: string = '*'): Promise<string> {
    const pipeline = this.createPipeline()

    if (column !== '*') {
      pipeline.push({ $match: { [column]: { $ne: null } } })
    }

    pipeline.push({ $group: { [this.primaryKey]: null, count: { $sum: 1 } } })
    pipeline.push({ $project: { [this.primaryKey]: 0, count: 1 } })

    const result = await this.qb
      .aggregate(pipeline, { session: this.session })
      .toArray()

    return `${result[0]?.count || 0}`
  }

  /**
   * Calculate the average of a given column using distinct.
   */
  public async countDistinct(column: string): Promise<string> {
    const pipeline = this.createPipeline()

    if (column !== '*') {
      pipeline.push({ $match: { [column]: { $ne: null } } })
    }

    pipeline.push({
      $group: { [this.primaryKey]: null, set: { $addToSet: `$${column}` } }
    })
    pipeline.push({
      $project: { [this.primaryKey]: 0, count: { $size: `$set` } }
    })

    const [{ count }] = await this.qb
      .aggregate(pipeline, { session: this.session })
      .toArray()

    return `${count}`
  }

  /**
   * Find a value in database.
   */
  public async find<T = any>(): Promise<T> {
    const pipeline = this.createPipeline()

    const data = await this.qb
      .aggregate(pipeline, { session: this.session })
      .toArray()

    return data[0] as T
  }

  /**
   * Find many values in database.
   */
  public async findMany<T = any>(): Promise<T[]> {
    const pipeline = this.createPipeline()

    return this.qb
      .aggregate(pipeline, { session: this.session })
      .toArray() as Promise<T[]>
  }

  /**
   * Find many values in database and return as paginated response.
   */
  public async paginate<T = any>(
    page = 0,
    limit = 10,
    resourceUrl = '/'
  ): Promise<PaginatedResponse<T>> {
    const pipeline = this.createPipeline({
      clearWhere: false,
      clearOrWhere: false,
      clearPipeline: false
    })

    pipeline.push({ $group: { [this.primaryKey]: null, count: { $sum: 1 } } })
    pipeline.push({ $project: { [this.primaryKey]: 0, count: 1 } })

    const result = await this.qb
      .aggregate(pipeline, { session: this.session })
      .toArray()

    const count = result[0]?.count || 0

    const data = await this.offset(page).limit(limit).findMany()

    return Exec.pagination(data, count, { page, limit, resourceUrl })
  }

  /**
   * Create a value in database.
   */
  public async create<T = any>(data: Partial<T> = {}): Promise<T> {
    if (Is.Array(data)) {
      throw new WrongMethodException('create', 'createMany')
    }

    const created = await this.createMany([data])

    return created[0]
  }

  /**
   * Create many values in database.
   */
  public async createMany<T = any>(data: Partial<T>[] = []): Promise<T[]> {
    if (!Is.Array(data)) {
      throw new WrongMethodException('createMany', 'create')
    }

    const { insertedIds } = await this.qb.insertMany(data, {
      session: this.session
    })

    const insertedIdsArray = []

    Object.keys(insertedIds).forEach(key =>
      insertedIdsArray.push(insertedIds[key])
    )

    return this.whereIn(this.primaryKey, insertedIdsArray).findMany()
  }

  /**
   * Create data or update if already exists.
   */
  public async createOrUpdate<T = any>(
    data: Partial<T> = {}
  ): Promise<T | T[]> {
    const pipeline = this.createPipeline()

    const hasValue = (
      await this.qb.aggregate(pipeline, { session: this.session }).toArray()
    )[0]

    if (hasValue) {
      return this.where(this.primaryKey, hasValue[this.primaryKey]).update(data)
    }

    return this.create(data)
  }

  /**
   * Update a value in database.
   */
  public async update<T = any>(data: Partial<T>): Promise<T | T[]> {
    const where = this.createWhere({ clearWhere: false, clearOrWhere: false })
    const pipeline = this.createPipeline()

    await this.qb.updateMany(
      where,
      { $set: data },
      { upsert: false, session: this.session }
    )

    const result = await this.qb
      .aggregate(pipeline, { session: this.session })
      .toArray()

    if (result.length === 1) {
      return result[0] as T
    }

    return result as T[]
  }

  /**
   * Delete one value in database.
   */
  public async delete(): Promise<void> {
    await this.qb.deleteMany(this.createWhere(), { session: this.session })
  }

  /**
   * Set the table that this query will be executed.
   */
  public table(table: string) {
    if (!this.isConnected) {
      throw new NotConnectedDatabaseException()
    }

    this.tableName = table
    this.qb = this.query()

    return this
  }

  /**
   * Log in console the actual query built.
   */
  public dump() {
    console.log({
      where: this._where,
      orWhere: this._orWhere,
      pipeline: this.pipeline
    })

    return this
  }

  /**
   * Set the columns that should be selected on query.
   */
  public select(...columns: string[]) {
    if (columns.includes('*')) {
      return this
    }

    if (!columns.includes('_id')) {
      const isAlreadyHide = !!this.pipeline
        .map(step => {
          if (!step.$project) {
            return false
          }

          if (!step.$project._id) {
            return false
          }

          if (step.$project._id === 0) {
            return false
          }

          return true
        })
        .find(value => value === true)

      if (!isAlreadyHide) {
        this.pipeline.push({ $project: { _id: 0 } })
      }
    }

    const $project = columns.reduce((previous, column) => {
      if (column.includes(`${this.tableName}.`)) {
        column = column.replace(`${this.tableName}.`, '')
      }

      if (column.includes(' as ')) {
        const [select, alias] = column.split(' as ')

        previous[select] = 0
        previous[alias] = `$${select}`

        return previous
      }

      previous[column] = 1

      return previous
    }, {})

    this.pipeline.push({ $project })

    return this
  }

  /**
   * Set the columns that should be selected on query raw.
   */
  public selectRaw(): this {
    throw new NotImplementedMethodException(this.selectRaw.name, 'mongo')
  }

  /**
   * Set the table that should be used on query.
   * Different from `table()` method, this method
   * doesn't change the driver table.
   */
  public from(): this {
    throw new NotImplementedMethodException(this.from.name, 'mongo')
  }

  /**
   * Set the table that should be used on query raw.
   * Different from `table()` method, this method
   * doesn't change the driver table.
   */
  public fromRaw(): this {
    throw new NotImplementedMethodException(this.selectRaw.name, 'mongo')
  }

  /**
   * Set a join statement in your query.
   */
  public join(
    table: any,
    column1?: any,
    operation?: any | Operations,
    column2?: any
  ) {
    let foreignField = column2 || operation || this.primaryKey

    if (foreignField.includes('.')) {
      foreignField = foreignField.split('.')[1]
    }

    let localField = column1 || this.primaryKey

    if (localField.includes('.')) {
      localField = localField.split('.')[1]
    }

    this.pipeline.push({
      $lookup: { from: table, localField, foreignField, as: table }
    })

    return this
  }

  /**
   * Set a left join statement in your query.
   */
  public leftJoin(
    table: any,
    column1?: any,
    operation?: any | Operations,
    column2?: any
  ) {
    return this.join(table, column1, operation, column2)
  }

  /**
   * Set a right join statement in your query.
   */
  public rightJoin(
    table: any,
    column1?: any,
    operation?: any | Operations,
    column2?: any
  ) {
    return this.join(table, column1, operation, column2)
  }

  /**
   * Set a cross join statement in your query.
   */
  public crossJoin(
    table: any,
    column1?: any,
    operation?: any | Operations,
    column2?: any
  ) {
    return this.join(table, column1, operation, column2)
  }

  /**
   * Set a full outer join statement in your query.
   */
  public fullOuterJoin(
    table: any,
    column1?: any,
    operation?: any | Operations,
    column2?: any
  ) {
    return this.join(table, column1, operation, column2)
  }

  /**
   * Set a left outer join statement in your query.
   */
  public leftOuterJoin(
    table: any,
    column1?: any,
    operation?: any | Operations,
    column2?: any
  ) {
    return this.join(table, column1, operation, column2)
  }

  /**
   * Set a right outer join statement in your query.
   */
  public rightOuterJoin(
    table: any,
    column1?: any,
    operation?: any | Operations,
    column2?: any
  ) {
    return this.join(table, column1, operation, column2)
  }

  /**
   * Set a join raw statement in your query.
   */
  public joinRaw(): this {
    throw new NotImplementedMethodException(this.joinRaw.name, 'mongo')
  }

  /**
   * Set a group by statement in your query.
   */
  public groupBy(...columns: string[]) {
    const $group = { [this.primaryKey]: {} }

    columns.forEach(column => ($group[this.primaryKey][column] = `$${column}`))

    this.pipeline.push({ $group })
    this.pipeline.push({ $replaceRoot: { newRoot: `$${this.primaryKey}` } })

    return this
  }

  /**
   * Set a group by raw statement in your query.
   */
  public groupByRaw(): this {
    throw new NotImplementedMethodException(this.groupByRaw.name, 'mongo')
  }

  public having(column: string): this
  public having(column: string, value: any): this
  public having(column: string, operation: Operations, value: any): this

  /**
   * Set a having statement in your query.
   */
  public having(column: any, operation?: Operations, value?: any) {
    return this.where(column, operation, value)
  }

  /**
   * Set a having raw statement in your query.
   */
  public havingRaw(): this {
    throw new NotImplementedMethodException(this.havingRaw.name, 'mongo')
  }

  /**
   * Set a having exists statement in your query.
   */
  public havingExists(): this {
    throw new NotImplementedMethodException(this.havingExists.name, 'mongo')
  }

  /**
   * Set a having not exists statement in your query.
   */
  public havingNotExists(): this {
    throw new NotImplementedMethodException(this.havingNotExists.name, 'mongo')
  }

  /**
   * Set a having in statement in your query.
   */
  public havingIn(column: string, values: any[]) {
    return this.whereIn(column, values)
  }

  /**
   * Set a having not in statement in your query.
   */
  public havingNotIn(column: string, values: any[]) {
    return this.whereNotIn(column, values)
  }

  /**
   * Set a having between statement in your query.
   */
  public havingBetween(column: string, values: [any, any]) {
    return this.whereBetween(column, values)
  }

  /**
   * Set a having not between statement in your query.
   */
  public havingNotBetween(column: string, values: [any, any]) {
    return this.whereNotBetween(column, values)
  }

  /**
   * Set a having null statement in your query.
   */
  public havingNull(column: string) {
    return this.whereNull(column)
  }

  /**
   * Set a having not null statement in your query.
   */
  public havingNotNull(column: string) {
    return this.whereNotNull(column)
  }

  public orHaving(column: string): this
  public orHaving(column: string, value: any): this
  public orHaving(column: string, operation: Operations, value: any): this

  /**
   * Set an or having statement in your query.
   */
  public orHaving(column: any, operation?: Operations, value?: any) {
    return this.orWhere(column, operation, value)
  }

  /**
   * Set an or having raw statement in your query.
   */
  public orHavingRaw(): this {
    throw new NotImplementedMethodException(this.orHavingRaw.name, 'mongo')
  }

  /**
   * Set an or having exists statement in your query.
   */
  public orHavingExists(): this {
    throw new NotImplementedMethodException(this.orHavingExists.name, 'mongo')
  }

  /**
   * Set an or having not exists statement in your query.
   */
  public orHavingNotExists(): this {
    throw new NotImplementedMethodException(
      this.orHavingNotExists.name,
      'mongo'
    )
  }

  /**
   * Set an or having in statement in your query.
   */
  public orHavingIn(column: string, values: any[]) {
    return this.orWhereIn(column, values)
  }

  /**
   * Set an or having not in statement in your query.
   */
  public orHavingNotIn(column: string, values: any[]) {
    return this.orWhereNotIn(column, values)
  }

  /**
   * Set an or having between statement in your query.
   */
  public orHavingBetween(column: string, values: [any, any]) {
    return this.orWhereBetween(column, values)
  }

  /**
   * Set an or having not between statement in your query.
   */
  public orHavingNotBetween(column: string, values: [any, any]) {
    return this.orWhereNotBetween(column, values)
  }

  /**
   * Set an or having null statement in your query.
   */
  public orHavingNull(column: string) {
    return this.whereNull(column)
  }

  /**
   * Set an or having not null statement in your query.
   */
  public orHavingNotNull(column: string) {
    return this.whereNotNull(column)
  }

  public where(statement: Record<string, any>): this
  public where(key: string, value: any): this
  public where(key: string, operation: Operations, value: any): this

  /**
   * Set a where statement in your query.
   */
  public where(statement: any, operation?: Operations, value?: any) {
    if (Is.Function(statement)) {
      statement(this)

      return this
    }

    if (operation === undefined) {
      this._where.push(statement)

      return this
    }

    if (value === undefined) {
      this._where.push({ [statement]: this.setOperator(operation, '=') })

      return this
    }

    this._where.push({ [statement]: this.setOperator(value, operation) })

    return this
  }

  public whereNot(statement: Record<string, any>): this
  public whereNot(key: string, value: any): this

  /**
   * Set a where not statement in your query.
   */
  public whereNot(statement: any, value?: any) {
    return this.where(statement, '<>', value)
  }

  /**
   * Set a where raw statement in your query.
   */
  public whereRaw(): this {
    throw new NotImplementedMethodException(this.whereRaw.name, 'mongo')
  }

  /**
   * Set a where exists statement in your query.
   */
  public whereExists(): this {
    throw new NotImplementedMethodException(this.whereExists.name, 'mongo')
  }

  /**
   * Set a where not exists statement in your query.
   */
  public whereNotExists(): this {
    throw new NotImplementedMethodException(this.whereNotExists.name, 'mongo')
  }

  /**
   * Set a where like statement in your query.
   */
  public whereLike(column: string, value: any) {
    return this.where(column, 'like', value)
  }

  /**
   * Set a where ILike statement in your query.
   */
  public whereILike(column: string, value: any) {
    return this.where(column, 'ilike', value)
  }

  /**
   * Set a where in statement in your query.
   */
  public whereIn(column: string, values: any[]) {
    this._where.push({ [column]: { $in: values } })

    return this
  }

  /**
   * Set a where not in statement in your query.
   */
  public whereNotIn(column: string, values: any[]) {
    this._where.push({ [column]: { $nin: values } })

    return this
  }

  /**
   * Set a where between statement in your query.
   */
  public whereBetween(column: string, values: [any, any]) {
    this._where.push({ [column]: { $gte: values[0], $lte: values[1] } })

    return this
  }

  /**
   * Set a where not between statement in your query.
   */
  public whereNotBetween(column: string, values: [any, any]) {
    this._where.push({
      [column]: { $not: { $gte: values[0], $lte: values[1] } }
    })

    return this
  }

  /**
   * Set a where null statement in your query.
   */
  public whereNull(column: string) {
    this._where.push({ [column]: null })

    return this
  }

  /**
   * Set a where not null statement in your query.
   */
  public whereNotNull(column: string) {
    this._where.push({ [column]: { $ne: null } })

    return this
  }

  public orWhere(statement: Record<string, any>): this
  public orWhere(key: string, value: any): this
  public orWhere(key: string, operation: Operations, value: any): this

  /**
   * Set a or where statement in your query.
   */
  public orWhere(statement: any, operation?: Operations, value?: any) {
    if (Is.Function(statement)) {
      statement(this)

      return this
    }

    if (operation === undefined) {
      this._orWhere.push(statement)

      return this
    }

    if (value === undefined) {
      this._orWhere.push({ [statement]: this.setOperator(operation, '=') })

      return this
    }

    this._orWhere.push({ [statement]: this.setOperator(value, operation) })

    return this
  }

  public orWhereNot(statement: Record<string, any>): this
  public orWhereNot(key: string, value: any): this

  /**
   * Set an or where not statement in your query.
   */
  public orWhereNot(statement: any, value?: any) {
    return this.orWhere(statement, '<>', value)
  }

  /**
   * Set a or where raw statement in your query.
   */
  public orWhereRaw(): this {
    throw new NotImplementedMethodException(this.orWhereRaw.name, 'mongo')
  }

  /**
   * Set an or where exists statement in your query.
   */
  public orWhereExists(): this {
    throw new NotImplementedMethodException(this.orWhereExists.name, 'mongo')
  }

  /**
   * Set an or where not exists statement in your query.
   */
  public orWhereNotExists(): this {
    throw new NotImplementedMethodException(this.orWhereNotExists.name, 'mongo')
  }

  /**
   * Set an or where like statement in your query.
   */
  public orWhereLike(column: string, value: any) {
    return this.orWhere(column, 'like', value)
  }

  /**
   * Set an or where ILike statement in your query.
   */
  public orWhereILike(column: string, value: any) {
    return this.orWhere(column, 'ilike', value)
  }

  /**
   * Set an or where in statement in your query.
   */
  public orWhereIn(column: string, values: any[]) {
    this._orWhere.push({ [column]: { $in: values } })

    return this
  }

  /**
   * Set an or where not in statement in your query.
   */
  public orWhereNotIn(column: string, values: any[]) {
    this._orWhere.push({ [column]: { $nin: values } })

    return this
  }

  /**
   * Set an or where between statement in your query.
   */
  public orWhereBetween(column: string, values: [any, any]) {
    this._orWhere.push({ [column]: { $gte: values[0], $lte: values[1] } })

    return this
  }

  /**
   * Set an or where not between statement in your query.
   */
  public orWhereNotBetween(column: string, values: [any, any]) {
    this._orWhere.push({
      [column]: { $not: { $gte: values[0], $lte: values[1] } }
    })

    return this
  }

  /**
   * Set an or where null statement in your query.
   */
  public orWhereNull(column: string) {
    this._orWhere.push({ [column]: null })

    return this
  }

  /**
   * Set an or where not null statement in your query.
   */
  public orWhereNotNull(column: string) {
    this._orWhere.push({ [column]: { $ne: null } })

    return this
  }

  /**
   * Set an order by statement in your query.
   */
  public orderBy(column: string, direction: Direction = 'ASC') {
    this.pipeline.push({
      $sort: { [column]: direction.toLowerCase() === 'asc' ? 1 : -1 }
    })

    return this
  }

  /**
   * Set an order by raw statement in your query.
   */
  public orderByRaw(): this {
    throw new NotImplementedMethodException(this.orderByRaw.name, 'mongo')
  }

  /**
   * Order the results easily by the latest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   */
  public latest(column: string = 'createdAt') {
    return this.orderBy(column, 'DESC')
  }

  /**
   * Order the results easily by the oldest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   */
  public oldest(column: string = 'createdAt') {
    return this.orderBy(column, 'ASC')
  }

  /**
   * Set the skip number in your query.
   */
  public offset(number: number) {
    this.pipeline.push({ $skip: number })

    return this
  }

  /**
   * Set the limit number in your query.
   */
  public limit(number: number) {
    this.pipeline.push({ $limit: number })

    return this
  }

  /**
   * Set the mongo operation in value.
   */
  private setOperator(value: any, operator: string) {
    if (operator === '=') {
      return value
    }

    const mongoOperator = MONGO_OPERATIONS_DICTIONARY[operator]

    const object: any = { [mongoOperator]: value }

    if (operator === 'like' || operator === 'ilike') {
      let valueRegexString = value.replace(/%/g, '')

      if (!value.startsWith('%') && value.endsWith('%')) {
        valueRegexString = `^${valueRegexString}`
      } else if (value.startsWith('%') && !value.endsWith('%')) {
        valueRegexString = `${valueRegexString}$`
      }

      object[mongoOperator] = new RegExp(valueRegexString)
    }

    if (operator === 'ilike') {
      object.$options = 'i'
    }

    return object
  }

  /**
   * Creates the where clause with where and orWhere.
   */
  private createWhere(
    options: {
      clearPipeline?: boolean
      clearWhere?: boolean
      clearOrWhere?: boolean
    } = {}
  ) {
    options = Options.create(options, {
      clearWhere: true,
      clearOrWhere: true
    })

    const where: any = {}

    if (!Is.Empty(this._where)) {
      where.$and = Json.copy(this._where)
    }

    if (!Is.Empty(this._orWhere)) {
      where.$or = Json.copy(this._orWhere)
    }

    if (options.clearWhere) {
      this._where = []
    }

    if (options.clearOrWhere) {
      this._orWhere = []
    }

    return where
  }

  /**
   * Creates the aggregation pipeline.
   */
  private createPipeline(
    options: {
      clearPipeline?: boolean
      clearWhere?: boolean
      clearOrWhere?: boolean
    } = {}
  ) {
    options = Options.create(options, {
      clearWhere: true,
      clearOrWhere: true,
      clearPipeline: true
    })

    const pipeline = Json.copy(this.pipeline)

    if (options.clearPipeline) {
      this.pipeline = []
    }

    pipeline.push({ $match: this.createWhere(options) })

    return pipeline
  }
}
