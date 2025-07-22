/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */

import {
  Exec,
  Is,
  Json,
  Options,
  type PaginatedResponse,
  type PaginationOptions
} from '@athenna/common'

import type { Knex } from 'knex'
import { debug } from '#src/debug'
import { Log } from '@athenna/logger'
import { Driver } from '#src/database/drivers/Driver'
import { ConnectionFactory } from '#src/factories/ConnectionFactory'
import { Transaction } from '#src/database/transactions/Transaction'
import type { ConnectionOptions, Direction, Operations } from '#src/types'
import { MigrationSource } from '#src/database/migrations/MigrationSource'
import { WrongMethodException } from '#src/exceptions/WrongMethodException'
import { PROTECTED_QUERY_METHODS } from '#src/constants/ProtectedQueryMethods'
import { NotConnectedDatabaseException } from '#src/exceptions/NotConnectedDatabaseException'

export class SqliteDriver extends Driver<Knex, Knex.QueryBuilder> {
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

    const knex = this.getKnex()
    const configs = Config.get(`database.connections.${this.connection}`, {})
    const knexOpts = {
      client: 'better-sqlite3',
      migrations: {
        tableName: 'migrations'
      },
      pool: {
        min: 2,
        max: 20,
        acquireTimeoutMillis: 60 * 1000
      },
      debug: false,
      useNullAsDefault: false,
      ...Json.omit(configs, ['driver', 'validations'])
    }

    debug('creating new connection using Knex. options defined: %o', knexOpts)

    if (Config.is('rc.bootLogs', true)) {
      Log.channelOrVanilla('application').success(
        `Successfully connected to ({yellow} ${this.connection}) database connection`
      )
    }

    this.client = knex.default(knexOpts)

    this.isConnected = true
    this.isSavedOnFactory = options.saveOnFactory

    if (this.isSavedOnFactory) {
      ConnectionFactory.setClient(this.connection, this.client)
    }

    this.qb = this.query()
  }

  /**
   * Close the connection with database in this instance.
   */
  public async close(): Promise<void> {
    if (!this.isConnected) {
      return
    }

    await this.client.destroy()

    this.qb = null
    this.tableName = null
    this.client = null
    this.isConnected = false

    ConnectionFactory.setClient(this.connection, null)
  }

  /**
   * Creates a new instance of query builder.
   */
  public query(): Knex.QueryBuilder {
    if (!this.isConnected) {
      throw new NotConnectedDatabaseException()
    }

    const query = this.useSetQB
      ? this.qb.table(this.tableName)
      : this.client.queryBuilder().table(this.tableName)

    const handler = {
      get: (target: Knex.QueryBuilder, propertyKey: string) => {
        if (PROTECTED_QUERY_METHODS.includes(propertyKey)) {
          this.qb = this.query()
        }

        return target[propertyKey]
      }
    }

    return new Proxy(query, handler)
  }

  /**
   * Sync a model schema with database.
   */
  public async sync(): Promise<void> {
    debug(
      `database sync with ${SqliteDriver.name} is not available yet, use migration instead.`
    )
  }

  /**
   * Create a new transaction.
   */
  public async startTransaction(): Promise<
    Transaction<Knex.Transaction, Knex.QueryBuilder>
  > {
    const trx = await this.client.transaction()

    return new Transaction(this.clone().setClient(trx))
  }

  /**
   * Commit the transaction.
   */
  public async commitTransaction(): Promise<void> {
    const client = this.client as Knex.Transaction

    await client.commit()

    this.tableName = null
    this.client = null
    this.isConnected = false
  }

  /**
   * Rollback the transaction.
   */
  public async rollbackTransaction(): Promise<void> {
    const client = this.client as Knex.Transaction

    await client.rollback()

    this.tableName = null
    this.client = null
    this.isConnected = false
  }

  /**
   * Run database migrations.
   */
  public async runMigrations(): Promise<void> {
    await this.client.migrate.latest({
      migrationSource: new MigrationSource(this.connection)
    })
  }

  /**
   * Revert database migrations.
   */
  public async revertMigrations(): Promise<void> {
    await this.client.migrate.rollback({
      migrationSource: new MigrationSource(this.connection)
    })
  }

  /**
   * List all databases available.
   */
  public async getDatabases(): Promise<string[]> {
    const databases = await this.raw('PRAGMA database_list')

    return databases.map(database => database.name)
  }

  /**
   * Get the current database name.
   */
  public async getCurrentDatabase(): Promise<string | undefined> {
    return this.client.client.database()
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
  public async createDatabase(database: string): Promise<void> {
    /**
     * Catching the error to simulate IF NOT EXISTS
     */
    try {
      await this.raw('CREATE DATABASE ??', database)
    } catch (_err) {}
  }

  /**
   * Drop some database.
   */
  public async dropDatabase(database: string): Promise<void> {
    /**
     * Catching the error to simulate IF EXISTS
     */
    try {
      await this.raw('DROP DATABASE ??', database)
    } catch (_err) {}
  }

  /**
   * List all tables available.
   */
  public async getTables(): Promise<string[]> {
    const tables = await this.raw(
      "SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
      await this.getCurrentDatabase()
    )

    return tables.map(table => table.name)
  }

  /**
   * Verify if table exists.
   */
  public async hasTable(table: string): Promise<boolean> {
    return this.client.schema.hasTable(table)
  }

  /**
   * Create a new table in database.
   */
  public async createTable(
    table: string,
    closure: (builder: Knex.TableBuilder) => void | Promise<void>
  ): Promise<void> {
    await this.client.schema.createTable(table, closure)
  }

  /**
   * Alter a table in database.
   */
  public async alterTable(
    table: string,
    closure: (builder: Knex.TableBuilder) => void | Promise<void>
  ): Promise<void> {
    await this.client.schema.alterTable(table, closure)
  }

  /**
   * Drop a table in database.
   */
  public async dropTable(table: string): Promise<void> {
    await this.client.schema.dropTableIfExists(table)
  }

  /**
   * Remove all data inside some database table
   * and restart the identity of the table.
   */
  public async truncate(table: string): Promise<void> {
    await this.raw('DELETE FROM ??', table)
  }

  /**
   * Make a raw query in database.
   */
  public raw<T = any>(sql: string, bindings?: any): T {
    return this.client.raw(sql, bindings) as any
  }

  /**
   * Calculate the average of a given column.
   */
  public async avg(column: string): Promise<string> {
    const [{ avg }] = await this.qb.avg({ avg: column })

    return avg
  }

  /**
   * Calculate the average of a given column using distinct.
   */
  public async avgDistinct(column: string): Promise<string> {
    const [{ avg }] = await this.qb.avgDistinct({ avg: column })

    return avg
  }

  /**
   * Get the max number of a given column.
   */
  public async max(column: string): Promise<string> {
    const [{ max }] = await this.qb.max({ max: column })

    return max
  }

  /**
   * Get the min number of a given column.
   */
  public async min(column: string): Promise<string> {
    const [{ min }] = await this.qb.min({ min: column })

    return min
  }

  /**
   * Sum all numbers of a given column.
   */
  public async sum(column: string): Promise<string> {
    const [{ sum }] = await this.qb.sum({ sum: column })

    return sum
  }

  /**
   * Sum all numbers of a given column in distinct mode.
   */
  public async sumDistinct(column: string): Promise<string> {
    const [{ sum }] = await this.qb.sumDistinct({ sum: column })

    return sum
  }

  /**
   * Increment a value of a given column.
   */
  public async increment(column: string): Promise<void> {
    await this.qb.increment(column)
  }

  /**
   * Decrement a value of a given column.
   */
  public async decrement(column: string): Promise<void> {
    await this.qb.decrement(column)
  }

  /**
   * Calculate the average of a given column using distinct.
   */
  public async count(column: string = '*'): Promise<string> {
    const [{ count }] = await this.qb.count({ count: column })

    return `${count}`
  }

  /**
   * Calculate the average of a given column using distinct.
   */
  public async countDistinct(column: string): Promise<string> {
    const [{ count }] = await this.qb.countDistinct({ count: column })

    return `${count}`
  }

  /**
   * Find a value in database.
   */
  public async find<T = any>(): Promise<T> {
    return this.qb.first()
  }

  /**
   * Find many values in database.
   */
  public async findMany<T = any>(): Promise<T[]> {
    const data = await this.qb

    this.qb = this.query()

    return data
  }

  /**
   * Find many values in database and return as paginated response.
   */
  public async paginate<T = any>(
    page: PaginationOptions | number = { page: 0, limit: 10, resourceUrl: '/' },
    limit = 10,
    resourceUrl = '/'
  ): Promise<PaginatedResponse<T>> {
    if (Is.Number(page)) {
      page = { page, limit, resourceUrl }
    }

    const [{ count }] = await this.qb
      .clone()
      .clearOrder()
      .clearSelect()
      .count({ count: '*' })

    const data = await this.offset(page.page * page.limit)
      .limit(page.limit)
      .findMany()

    return Exec.pagination(data, parseInt(count), page)
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

    return this.qb.insert(data, '*')
  }

  /**
   * Create data or update if already exists.
   */
  public async createOrUpdate<T = any>(
    data: Partial<T> = {}
  ): Promise<T | T[]> {
    const query = this.qb.clone()
    const hasValue = await query.first()

    if (hasValue) {
      await this.qb
        .where(this.primaryKey, hasValue[this.primaryKey])
        .update(data)

      return this.where(this.primaryKey, hasValue[this.primaryKey]).find()
    }

    return this.create(data)
  }

  /**
   * Update a value in database.
   */
  public async update<T = any>(data: Partial<T>): Promise<T | T[]> {
    await this.qb.clone().update(data)

    const result = await this.findMany()

    if (result.length === 1) {
      return result[0]
    }

    return result
  }

  /**
   * Delete one value in database.
   */
  public async delete(): Promise<void> {
    await this.qb.delete()
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
    console.log(this.qb.toSQL().toNative())

    return this
  }

  /**
   * Set the columns that should be selected on query.
   */
  public select(...columns: string[]) {
    this.qb.select(...columns)

    return this
  }

  /**
   * Set the columns that should be selected on query raw.
   */
  public selectRaw(sql: string, bindings?: any) {
    return this.select(this.raw(sql, bindings) as any)
  }

  /**
   * Set the table that should be used on query.
   * Different from `table()` method, this method
   * doesn't change the driver table.
   */
  public from(table: string) {
    this.qb.from(table)

    return this
  }

  /**
   * Set the table that should be used on query raw.
   * Different from `table()` method, this method
   * doesn't change the driver table.
   */
  public fromRaw(sql: string, bindings?: any) {
    return this.from(this.raw(sql, bindings) as any)
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
    return this.joinByType('join', table, column1, operation, column2)
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
    return this.joinByType('leftJoin', table, column1, operation, column2)
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
    return this.joinByType('rightJoin', table, column1, operation, column2)
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
    return this.joinByType('crossJoin', table, column1, operation, column2)
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
    return this.joinByType('fullOuterJoin', table, column1, operation, column2)
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
    return this.joinByType('leftOuterJoin', table, column1, operation, column2)
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
    return this.joinByType('rightOuterJoin', table, column1, operation, column2)
  }

  /**
   * Set a join raw statement in your query.
   */
  public joinRaw(sql: string, bindings?: any) {
    this.qb.joinRaw(sql, bindings)

    return this
  }

  /**
   * Set a group by statement in your query.
   */
  public groupBy(...columns: string[]) {
    this.qb.groupBy(...columns)

    return this
  }

  /**
   * Set a group by raw statement in your query.
   */
  public groupByRaw(sql: string, bindings?: any) {
    this.qb.groupByRaw(sql, bindings)

    return this
  }

  public having(column: string): this
  public having(column: string, value: any): this
  public having(column: string, operation: Operations, value: any): this

  /**
   * Set a having statement in your query.
   */
  public having(column: any, operation?: Operations, value?: any) {
    if (operation === undefined) {
      this.qb.having(column)

      return this
    }

    if (value === undefined) {
      this.qb.having(column, '=', operation)

      return this
    }

    this.qb.having(column, operation, value)

    return this
  }

  /**
   * Set a having raw statement in your query.
   */
  public havingRaw(sql: string, bindings?: any) {
    this.qb.havingRaw(sql, bindings)

    return this
  }

  /**
   * Set a having exists statement in your query.
   */
  public havingExists(closure: (query: SqliteDriver) => void) {
    const driver = this.clone() as SqliteDriver

    // @ts-ignore
    this.qb.havingExists(function () {
      closure(driver.setQueryBuilder(this, { useSetQB: true }))
    })

    return this
  }

  /**
   * Set a having not exists statement in your query.
   */
  public havingNotExists(closure: (query: SqliteDriver) => void) {
    const driver = this.clone() as SqliteDriver

    // @ts-ignore
    this.qb.havingNotExists(function () {
      closure(driver.setQueryBuilder(this, { useSetQB: true }))
    })

    return this
  }

  /**
   * Set a having in statement in your query.
   */
  public havingIn(column: string, values: any[]) {
    this.qb.havingIn(column, values)

    return this
  }

  /**
   * Set a having not in statement in your query.
   */
  public havingNotIn(column: string, values: any[]) {
    this.qb.havingNotIn(column, values)

    return this
  }

  /**
   * Set a having between statement in your query.
   */
  public havingBetween(column: string, values: [any, any]) {
    this.qb.havingBetween(column, values)

    return this
  }

  /**
   * Set a having not between statement in your query.
   */
  public havingNotBetween(column: string, values: [any, any]) {
    this.qb.havingNotBetween(column, values)

    return this
  }

  /**
   * Set a having null statement in your query.
   */
  public havingNull(column: string) {
    this.qb.havingNull(column)

    return this
  }

  /**
   * Set a having not null statement in your query.
   */
  public havingNotNull(column: string) {
    this.qb.havingNotNull(column)

    return this
  }

  public orHaving(column: string): this
  public orHaving(column: string, value: any): this
  public orHaving(column: string, operation: Operations, value: any): this

  /**
   * Set an or having statement in your query.
   */
  public orHaving(column: any, operation?: Operations, value?: any) {
    if (operation === undefined) {
      this.qb.orHaving(column)

      return this
    }

    if (value === undefined) {
      this.qb.orHaving(column, '=', operation)

      return this
    }

    this.qb.orHaving(column, operation, value)

    return this
  }

  /**
   * Set an or having raw statement in your query.
   */
  public orHavingRaw(sql: string, bindings?: any) {
    this.qb.orHavingRaw(sql, bindings)

    return this
  }

  /**
   * Set an or having exists statement in your query.
   */
  public orHavingExists(closure: (query: SqliteDriver) => void) {
    const driver = this.clone() as SqliteDriver

    // @ts-ignore
    this.qb.orHavingExists(function () {
      closure(driver.setQueryBuilder(this, { useSetQB: true }))
    })

    return this
  }

  /**
   * Set an or having not exists statement in your query.
   */
  public orHavingNotExists(closure: (query: SqliteDriver) => void) {
    const driver = this.clone() as SqliteDriver

    // @ts-ignore
    this.qb.orHavingNotExists(function () {
      closure(driver.setQueryBuilder(this, { useSetQB: true }))
    })

    return this
  }

  /**
   * Set an or having in statement in your query.
   */
  public orHavingIn(column: string, values: any[]) {
    // @ts-ignore
    this.qb.orHavingIn(column, values)

    return this
  }

  /**
   * Set an or having not in statement in your query.
   */
  public orHavingNotIn(column: string, values: any[]) {
    this.qb.orHavingNotIn(column, values)

    return this
  }

  /**
   * Set an or having between statement in your query.
   */
  public orHavingBetween(column: string, values: [any, any]) {
    this.qb.orHavingBetween(column, values)

    return this
  }

  /**
   * Set an or having not between statement in your query.
   */
  public orHavingNotBetween(column: string, values: [any, any]) {
    this.qb.orHavingNotBetween(column, values)

    return this
  }

  /**
   * Set an or having null statement in your query.
   */
  public orHavingNull(column: string) {
    // @ts-ignore
    this.qb.orHavingNull(column)

    return this
  }

  /**
   * Set an or having not null statement in your query.
   */
  public orHavingNotNull(column: string) {
    // @ts-ignore
    this.qb.orHavingNotNull(column)

    return this
  }

  public where(statement: Record<string, any>): this
  public where(key: string, value: any): this
  public where(key: string, operation: Operations, value: any): this

  /**
   * Set a where statement in your query.
   */
  public where(statement: any, operation?: Operations, value?: any) {
    if (Is.Function(statement)) {
      const driver = this.clone()

      this.qb.where(function () {
        statement(driver.setQueryBuilder(this, { useSetQB: true }))
      })

      return this
    }

    if (operation === undefined) {
      this.qb.where(statement)

      return this
    }

    if (value === undefined) {
      this.qb.where(statement, operation)

      return this
    }

    this.qb.where(statement, operation, value)

    return this
  }

  public whereNot(statement: Record<string, any>): this
  public whereNot(key: string, value: any): this

  /**
   * Set a where not statement in your query.
   */
  public whereNot(statement: any, value?: any) {
    if (Is.Function(statement)) {
      const driver = this.clone()

      this.qb.whereNot(function () {
        statement(driver.setQueryBuilder(this, { useSetQB: true }))
      })

      return this
    }

    if (value === undefined) {
      this.qb.whereNot(statement)

      return this
    }

    this.qb.whereNot(statement, value)

    return this
  }

  /**
   * Set a where raw statement in your query.
   */
  public whereRaw(sql: string, bindings?: any) {
    this.qb.whereRaw(sql, bindings)

    return this
  }

  /**
   * Set a where exists statement in your query.
   */
  public whereExists(closure: (query: SqliteDriver) => void) {
    const driver = this.clone() as SqliteDriver

    this.qb.whereExists(function () {
      closure(driver.setQueryBuilder(this, { useSetQB: true }))
    })

    return this
  }

  /**
   * Set a where not exists statement in your query.
   */
  public whereNotExists(closure: (query: SqliteDriver) => void) {
    const driver = this.clone() as SqliteDriver

    this.qb.whereNotExists(function () {
      closure(driver.setQueryBuilder(this, { useSetQB: true }))
    })

    return this
  }

  /**
   * Set a where like statement in your query.
   */
  public whereLike(column: string, value: any) {
    this.qb.whereLike(column, value)

    return this
  }

  /**
   * Set a where ILike statement in your query.
   */
  public whereILike(column: string, value: any) {
    this.qb.whereLike(column, value)

    return this
  }

  /**
   * Set a where in statement in your query.
   */
  public whereIn(column: string, values: any[]) {
    this.qb.whereIn(column, values)

    return this
  }

  /**
   * Set a where not in statement in your query.
   */
  public whereNotIn(column: string, values: any[]) {
    this.qb.whereNotIn(column, values)

    return this
  }

  /**
   * Set a where between statement in your query.
   */
  public whereBetween(column: string, values: [any, any]) {
    this.qb.whereBetween(column, values)

    return this
  }

  /**
   * Set a where not between statement in your query.
   */
  public whereNotBetween(column: string, values: [any, any]) {
    this.qb.whereNotBetween(column, values)

    return this
  }

  /**
   * Set a where null statement in your query.
   */
  public whereNull(column: string) {
    this.qb.whereNull(column)

    return this
  }

  /**
   * Set a where not null statement in your query.
   */
  public whereNotNull(column: string) {
    this.qb.whereNotNull(column)

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
      const driver = this.clone()

      this.qb.orWhere(function () {
        statement(driver.setQueryBuilder(this, { useSetQB: true }))
      })

      return this
    }

    if (operation === undefined) {
      this.qb.orWhere(statement)

      return this
    }

    if (value === undefined) {
      this.qb.orWhere(statement, operation)

      return this
    }

    this.qb.orWhere(statement, operation, value)

    return this
  }

  public orWhereNot(statement: Record<string, any>): this
  public orWhereNot(key: string, value: any): this

  /**
   * Set an or where not statement in your query.
   */
  public orWhereNot(statement: any, value?: any) {
    if (Is.Function(statement)) {
      const driver = this.clone()

      this.qb.orWhereNot(function () {
        statement(driver.setQueryBuilder(this, { useSetQB: true }))
      })

      return this
    }

    if (value === undefined) {
      this.qb.orWhereNot(statement)

      return this
    }

    this.qb.orWhereNot(statement, value)

    return this
  }

  /**
   * Set a or where raw statement in your query.
   */
  public orWhereRaw(sql: string, bindings?: any) {
    this.qb.orWhereRaw(sql, bindings)

    return this
  }

  /**
   * Set an or where exists statement in your query.
   */
  public orWhereExists(closure: (query: SqliteDriver) => void) {
    const driver = this.clone() as SqliteDriver

    this.qb.orWhereExists(function () {
      closure(driver.setQueryBuilder(this, { useSetQB: true }))
    })

    return this
  }

  /**
   * Set an or where not exists statement in your query.
   */
  public orWhereNotExists(closure: (query: SqliteDriver) => void) {
    const driver = this.clone() as SqliteDriver

    this.qb.orWhereNotExists(function () {
      closure(driver.setQueryBuilder(this, { useSetQB: true }))
    })

    return this
  }

  /**
   * Set an or where like statement in your query.
   */
  public orWhereLike(column: string, value: any) {
    this.qb.orWhereLike(column, value)

    return this
  }

  /**
   * Set an or where ILike statement in your query.
   */
  public orWhereILike(column: string, value: any) {
    this.qb.orWhereLike(column, value)

    return this
  }

  /**
   * Set an or where in statement in your query.
   */
  public orWhereIn(column: string, values: any[]) {
    this.qb.orWhereIn(column, values)

    return this
  }

  /**
   * Set an or where not in statement in your query.
   */
  public orWhereNotIn(column: string, values: any[]) {
    this.qb.orWhereNotIn(column, values)

    return this
  }

  /**
   * Set an or where between statement in your query.
   */
  public orWhereBetween(column: string, values: [any, any]) {
    this.qb.orWhereBetween(column, values)

    return this
  }

  /**
   * Set an or where not between statement in your query.
   */
  public orWhereNotBetween(column: string, values: [any, any]) {
    this.qb.orWhereNotBetween(column, values)

    return this
  }

  /**
   * Set an or where null statement in your query.
   */
  public orWhereNull(column: string) {
    this.qb.orWhereNull(column)

    return this
  }

  /**
   * Set an or where not null statement in your query.
   */
  public orWhereNotNull(column: string) {
    this.qb.orWhereNotNull(column)

    return this
  }

  /**
   * Set an order by statement in your query.
   */
  public orderBy(column: string, direction: Direction = 'ASC') {
    this.qb.orderBy(column, direction.toUpperCase())

    return this
  }

  /**
   * Set an order by raw statement in your query.
   */
  public orderByRaw(sql: string, bindings?: any) {
    this.qb.orderByRaw(sql, bindings)

    return this
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
    this.qb.offset(number)

    return this
  }

  /**
   * Set the limit number in your query.
   */
  public limit(number: number) {
    this.qb.limit(number)

    return this
  }
}
