/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  Module,
  Options,
  Collection,
  type PaginatedResponse,
  type PaginationOptions
} from '@athenna/common'
import type { Knex, TableBuilder } from 'knex'
import type { ModelSchema } from '#src/models/schemas/ModelSchema'
import type { Transaction } from '#src/database/transactions/Transaction'
import type { Direction, ConnectionOptions, Operations } from '#src/types'
import { NotFoundDataException } from '#src/exceptions/NotFoundDataException'

export abstract class Driver<Client = any, QB = any> {
  /**
   * Set the primary key of the driver.
   */
  public primaryKey: string = 'id'

  /**
   * Set if this instance is connected with database.
   */
  public isConnected: boolean = false

  /**
   * Set if the connection will be saved on factory.
   */
  public isSavedOnFactory: boolean = false

  /**
   * The connection name used for this instance.
   */
  public connection: string = null

  /**
   * Set the table that this instance will work with.
   */
  public tableName: string = null

  /**
   * Set the client of this driver.
   */
  public client: Client = null

  /**
   * The main query builder of driver.
   */
  public qb: QB = null

  /**
   * Use set query builder instead of creating a new one
   * using client.
   */
  public useSetQB: boolean = false

  /**
   * Creates a new instance of the Driver.
   */
  public constructor(connection: string | any, client: Client = null) {
    this.connection = connection

    if (client) {
      this.client = client
      this.isConnected = true
      this.isSavedOnFactory = true
    }
  }

  /**
   * Import knex in a method to be easier to mock.
   */
  public getKnex() {
    const require = Module.createRequire(import.meta.url)

    return require('knex')
  }

  /**
   * Import mongoose in a method to be easier to mock.
   */
  public getMongoose() {
    const require = Module.createRequire(import.meta.url)

    let mongoose = require('mongoose')

    if (!mongoose.createConnection) {
      mongoose = mongoose.default
    }

    return mongoose
  }

  /**
   * Clone the driver instance.
   */
  public clone(): Driver<Client, QB> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return new this.constructor(this.connection, this.client)
  }

  /**
   * Return the client of driver.
   */
  public getClient(): Client {
    return this.client
  }

  /**
   * Set a client in driver.
   */
  public setClient(client: Client) {
    this.client = client

    return this
  }

  /**
   * Return the query builder of driver.
   */
  public getQueryBuilder(): QB {
    return this.qb
  }

  /**
   * Set a query builder in driver.
   */
  public setQueryBuilder(
    queryBuilder: QB,
    options: { useSetQB?: boolean } = {}
  ) {
    options = Options.create(options, {
      useSetQB: false
    })

    this.qb = queryBuilder
    this.useSetQB = options.useSetQB

    return this
  }

  /**
   * Set the primary key of the driver.
   */
  public setPrimaryKey(primaryKey: string) {
    this.primaryKey = primaryKey

    return this
  }

  /**
   * Create a join clause by join type
   */
  public joinByType(
    joinType: string,
    table: any,
    column1?: string,
    operation?: string | Operations,
    column2?: string
  ) {
    if (!column1) {
      this.qb[joinType](table)

      return this
    }

    if (!operation) {
      this.qb[joinType](table, column1)

      return this
    }

    if (!column2) {
      this.qb[joinType](table, column1, operation)

      return this
    }

    this.qb[joinType](table, column1, operation, column2)

    return this
  }

  /**
   * Connect to database.
   */
  public abstract connect(options?: ConnectionOptions): void

  /**
   * Close the connection with database in this instance.
   */
  public abstract close(): Promise<void>

  /**
   * Creates a new instance of query builder.
   */
  public abstract query(): QB

  /**
   * Sync a model schema with the driver.
   */
  public abstract sync(schema: ModelSchema): Promise<any>

  /**
   * Create a new transaction.
   */
  public abstract startTransaction(): Promise<Transaction<Client, QB>>

  /**
   * Commit the transaction.
   */
  public abstract commitTransaction(): Promise<void>

  /**
   * Rollback the transaction.
   */
  public abstract rollbackTransaction(): Promise<void>

  /**
   * Run database migrations.
   */
  public abstract runMigrations(): Promise<void>

  /**
   * Revert database migrations.
   */
  public abstract revertMigrations(): Promise<void>

  /**
   * List all databases available.
   */
  public abstract getDatabases(): Promise<string[]>

  /**
   * Get the current database name.
   */
  public abstract getCurrentDatabase(): Promise<string | undefined>

  /**
   * Verify if database exists.
   */
  public abstract hasDatabase(database: string): Promise<boolean>

  /**
   * Create a new database.
   */
  public abstract createDatabase(database: string): Promise<void>

  /**
   * Drop some database.
   */
  public abstract dropDatabase(database: string): Promise<void>

  /**
   * List all tables available.
   */
  public abstract getTables(): Promise<string[]>

  /**
   * Verify if table exists.
   */
  public abstract hasTable(table: string): Promise<boolean>

  /**
   * Create a new table in database.
   */
  public abstract createTable(
    table: string,
    closure?: TableBuilder
  ): Promise<void>

  /**
   * Drop a table in database.
   */
  public abstract dropTable(table: string): Promise<void>

  /**
   * Remove all data inside some database table
   * and restart the identity of the table.
   */
  public abstract truncate(table: string): Promise<void>

  /**
   * Make a raw query in database.
   */
  public abstract raw<T = any>(sql: string, bindings?: any): Knex.Raw<T>

  /**
   * Calculate the average of a given column.
   */
  public abstract avg(column: string): Promise<string>

  /**
   * Calculate the average of a given column using distinct.
   */
  public abstract avgDistinct(column: string): Promise<string>

  /**
   * Get the max number of a given column.
   */
  public abstract max(column: string): Promise<string>

  /**
   * Get the min number of a given column.
   */
  public abstract min(column: string): Promise<string>

  /**
   * Sum all numbers of a given column.
   */
  public abstract sum(column: string): Promise<string>

  /**
   * Sum all numbers of a given column in distinct mode.
   */
  public abstract sumDistinct(column: string): Promise<string>

  /**
   * Increment a value of a given column.
   */
  public abstract increment(column: string): Promise<void>

  /**
   * Decrement a value of a given column.
   */
  public abstract decrement(column: string): Promise<void>

  /**
   * Calculate the average of a given column using distinct.
   */
  public abstract count(column?: string): Promise<string>

  /**
   * Calculate the average of a given column using distinct.
   */
  public abstract countDistinct(column?: string): Promise<string>

  /**
   * Find a value in database and return as boolean.
   */
  public async exists(): Promise<boolean> {
    const data = await this.find()

    return !!data
  }

  /**
   * Find a value in database or throw exception if undefined.
   */
  public async findOrFail<T = any>(): Promise<T> {
    const data = await this.find()

    if (!data) {
      throw new NotFoundDataException(this.connection)
    }

    return data
  }

  /**
   * Return a single model instance or, if no results are found,
   * execute the given closure.
   */
  public async findOr<T = any>(closure: () => T | Promise<T>): Promise<T> {
    const data = await this.find()

    if (!data) {
      return closure()
    }

    return data
  }

  /**
   * Find a value in database.
   */
  public abstract find<T = any>(): Promise<T>

  /**
   * Find many values in database.
   */
  public abstract findMany<T = any>(): Promise<T[]>

  /**
   * Find many values in database and return as a Collection.
   */
  public async collection<T = any>(): Promise<Collection<T>> {
    return new Collection(await this.findMany())
  }

  /**
   * Find many values in database and return as paginated response.
   */
  public abstract paginate<T = any>(
    page?: PaginationOptions | number,
    limit?: number,
    resourceUrl?: string
  ): Promise<PaginatedResponse<T>>

  /**
   * Create a value in database.
   */
  public abstract create<T = any>(data?: Partial<T>): Promise<T>

  /**
   * Create many values in database.
   */
  public abstract createMany<T = any>(data?: Partial<T>[]): Promise<T[]>

  /**
   * Create data or update if already exists.
   */
  public abstract createOrUpdate<T = any>(data?: Partial<T>): Promise<T | T[]>

  /**
   * Update a value in database.
   */
  public abstract update<T = any>(data: Partial<T>): Promise<T | T[]>

  /**
   * Delete one value in database.
   */
  public abstract delete(): Promise<void>

  /**
   * Set the table that this query will be executed.
   */
  public abstract table(tableName: string | any): this

  /**
   * Log in console the actual query built.
   */
  public abstract dump(): this

  /**
   * Executes the given closure when the first argument is true.
   */
  public when(
    criteria: any,
    closure: (query: this, criteriaValue?: any) => any | Promise<any>
  ) {
    if (!criteria) {
      return this
    }

    closure(this, criteria)

    return this
  }

  /**
   * Set the columns that should be selected on query.
   */
  public abstract select(...columns: string[]): this

  /**
   * Set the columns that should be selected on query raw.
   */
  public abstract selectRaw(sql: string, bindings?: any): this

  /**
   * Set the table that should be used on query.
   * Different from `table()` method, this method
   * doesn't change the driver table.
   */
  public abstract from(table: string): this

  /**
   * Set the table that should be used on query raw.
   * Different from `table()` method, this method
   * doesn't change the driver table.
   */
  public abstract fromRaw(sql: string, bindings?: any): this

  /**
   * Set a join statement in your query.
   */
  public abstract join(
    table: any,
    column1?: string,
    operation?: string | Operations,
    column2?: string
  ): this

  /**
   * Set a left join statement in your query.
   */
  public abstract leftJoin(
    table: any,
    column1?: string,
    operation?: string | Operations,
    column2?: string
  ): this

  /**
   * Set a right join statement in your query.
   */
  public abstract rightJoin(
    table: any,
    column1?: string,
    operation?: string | Operations,
    column2?: string
  ): this

  /**
   * Set a cross join statement in your query.
   */
  public abstract crossJoin(
    table: any,
    column1?: string,
    operation?: string | Operations,
    column2?: string
  ): this

  /**
   * Set a full outer join statement in your query.
   */
  public abstract fullOuterJoin(
    table: any,
    column1?: string,
    operation?: string | Operations,
    column2?: string
  ): this

  /**
   * Set a left outer join statement in your query.
   */
  public abstract leftOuterJoin(
    table: any,
    column1?: string,
    operation?: string | Operations,
    column2?: string
  ): this

  /**
   * Set a right outer join statement in your query.
   */
  public abstract rightOuterJoin(
    table: any,
    column1?: string,
    operation?: string | Operations,
    column2?: string
  ): this

  /**
   * Set a join raw statement in your query.
   */
  public abstract joinRaw(sql: string, bindings?: any): this

  /**
   * Set a group by statement in your query.
   */
  public abstract groupBy(...columns: string[]): this

  /**
   * Set a group by raw statement in your query.
   */
  public abstract groupByRaw(sql: string, bindings?: any): this

  /**
   * Set a having statement in your query.
   */
  public abstract having(
    column: any,
    operation?: string | Operations,
    value?: any
  ): this

  /**
   * Set a having raw statement in your query.
   */
  public abstract havingRaw(sql: string, bindings?: any): this

  /**
   * Set a having exists statement in your query.
   */
  public abstract havingExists(
    closure: (query: Driver<Client, QB>) => void
  ): this

  /**
   * Set a having not exists statement in your query.
   */
  public abstract havingNotExists(
    closure: (query: Driver<Client, QB>) => void
  ): this

  /**
   * Set a having in statement in your query.
   */
  public abstract havingIn(column: string, values: any[]): this

  /**
   * Set a having not in statement in your query.
   */
  public abstract havingNotIn(column: string, values: any[]): this

  /**
   * Set a having between statement in your query.
   */
  public abstract havingBetween(column: string, values: [any, any]): this

  /**
   * Set a having not between statement in your query.
   */
  public abstract havingNotBetween(column: string, values: [any, any]): this

  /**
   * Set a having null statement in your query.
   */
  public abstract havingNull(column: string): this

  /**
   * Set a having not null statement in your query.
   */
  public abstract havingNotNull(column: string): this

  /**
   * Set an or having statement in your query.
   */
  public abstract orHaving(
    column: any,
    operation?: string | Operations,
    value?: any
  ): this

  /**
   * Set an or having raw statement in your query.
   */
  public abstract orHavingRaw(sql: string, bindings?: any): this

  /**
   * Set an or having exists statement in your query.
   */
  public abstract orHavingExists(
    closure: (query: Driver<Client, QB>) => void
  ): this

  /**
   * Set an or having not exists statement in your query.
   */
  public abstract orHavingNotExists(
    closure: (query: Driver<Client, QB>) => void
  ): this

  /**
   * Set an or having in statement in your query.
   */
  public abstract orHavingIn(column: string, values: any[]): this

  /**
   * Set an or having not in statement in your query.
   */
  public abstract orHavingNotIn(column: string, values: any[]): this

  /**
   * Set an or having between statement in your query.
   */
  public abstract orHavingBetween(column: string, values: [any, any]): this

  /**
   * Set an or having not between statement in your query.
   */
  public abstract orHavingNotBetween(column: string, values: [any, any]): this

  /**
   * Set an or having null statement in your query.
   */
  public abstract orHavingNull(column: string): this

  /**
   * Set an or having not null statement in your query.
   */
  public abstract orHavingNotNull(column: string): this

  /**
   * Set a where statement in your query.
   */
  public abstract where(
    statement: any,
    operation?: string | Operations,
    value?: any
  ): this

  /**
   * Set a where not statement in your query.
   */
  public abstract whereNot(statement: any, value?: any): this

  /**
   * Set a where raw statement in your query.
   */
  public abstract whereRaw(sql: string, bindings?: any): this

  /**
   * Set a where exists statement in your query.
   */
  public abstract whereExists(
    closure: (query: Driver<Client, QB>) => void
  ): this

  /**
   * Set a where not exists statement in your query.
   */
  public abstract whereNotExists(
    closure: (query: Driver<Client, QB>) => void
  ): this

  /**
   * Set a where like statement in your query.
   */
  public abstract whereLike(statement: any, value?: any): this

  /**
   * Set a where ILike statement in your query.
   */
  public abstract whereILike(statement: any, value?: any): this

  /**
   * Set a where in statement in your query.
   */
  public abstract whereIn(column: string, values: any[]): this

  /**
   * Set a where not in statement in your query.
   */
  public abstract whereNotIn(column: string, values: any[]): this

  /**
   * Set a where between statement in your query.
   */
  public abstract whereBetween(column: string, values: [any, any]): this

  /**
   * Set a where not between statement in your query.
   */
  public abstract whereNotBetween(column: string, values: [any, any]): this

  /**
   * Set a where null statement in your query.
   */
  public abstract whereNull(column: string): this

  /**
   * Set a where not null statement in your query.
   */
  public abstract whereNotNull(column: string): this

  /**
   * Set a or where statement in your query.
   */
  public abstract orWhere(
    statement: string | Record<string, any>,
    operation: string | Record<string, any>,
    value: Record<string, any>
  ): this

  /**
   * Set an or where not statement in your query.
   */
  public abstract orWhereNot(
    statement: string | Record<string, any>,
    value: any
  ): this

  /**
   * Set a or where raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {MySqlDriver}
   */
  public abstract orWhereRaw(sql: string, bindings?: any): this

  /**
   * Set an or where exists statement in your query.
   */
  public abstract orWhereExists(
    closure: (query: Driver<Client, QB>) => void
  ): this

  /**
   * Set an or where not exists statement in your query.
   */
  public abstract orWhereNotExists(
    closure: (query: Driver<Client, QB>) => void
  ): this

  /**
   * Set an or where like statement in your query.
   */
  public abstract orWhereLike(statement: any, value?: any): this

  /**
   * Set an or where ILike statement in your query.
   */
  public abstract orWhereILike(statement: any, value?: any): this

  /**
   * Set an or where in statement in your query.
   */
  public abstract orWhereIn(column: string, values: any[]): this

  /**
   * Set an or where not in statement in your query.
   */
  public abstract orWhereNotIn(column: string, values: any[]): this

  /**
   * Set an or where between statement in your query.
   */
  public abstract orWhereBetween(column: string, values: [any, any]): this

  /**
   * Set an or where not between statement in your query.
   */
  public abstract orWhereNotBetween(column: string, values: [any, any]): this

  /**
   * Set an or where null statement in your query.
   */
  public abstract orWhereNull(column: string): this

  /**
   * Set an or where not null statement in your query.
   */
  public abstract orWhereNotNull(column: string): this

  /**
   * Set an order by statement in your query.
   */
  public abstract orderBy(column: string, direction?: Direction): this

  /**
   * Set an order by raw statement in your query.
   */
  public abstract orderByRaw(sql: string, bindings?: any): this

  /**
   * Order the results easily by the latest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   */
  public abstract latest(column?: string): this

  /**
   * Order the results easily by the oldest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   */
  public abstract oldest(column?: string): this

  /**
   * Set the skip number in your query.
   */
  public abstract offset(number: number): this

  /**
   * Set the limit number in your query.
   */
  public abstract limit(number: number): this
}
