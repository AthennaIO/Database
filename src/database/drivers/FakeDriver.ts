/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  Collection,
  Exec,
  Is,
  Json,
  Options,
  type PaginatedResponse
} from '@athenna/common'
import type { ConnectionOptions, Operations } from '#src/types'
import { Transaction } from '#src/database/transactions/Transaction'
import { WrongMethodException } from '#src/exceptions/WrongMethodException'
import { NotFoundDataException } from '#src/exceptions/NotFoundDataException'
import { NotConnectedDatabaseException } from '#src/exceptions/NotConnectedDatabaseException'

export class FakeDriver {
  public constructor(connection: string, client: any) {
    FakeDriver.connection = connection

    if (client) {
      FakeDriver.client = client
      FakeDriver.isConnected = true
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return FakeDriver
  }

  public static primaryKey = 'id'
  public static tables = ['fake']
  public static databases = ['fake']
  public static isConnected = false
  public static isSavedOnFactory = false
  public static tableName = 'fake'
  public static connection = 'fake'
  public static client = null
  public static qb = null
  public static useSetQB = false

  public static joinByType() {
    return this
  }

  public static clone() {
    return Json.copy(FakeDriver)
  }

  public static setPrimaryKey(primaryKey: string) {
    this.primaryKey = primaryKey

    return this
  }

  public static getClient() {
    return this.client
  }

  public static setClient(client: any) {
    this.client = client

    return this
  }

  public static getQueryBuilder() {
    return this.client
  }

  public static setQueryBuilder(client: any) {
    this.client = client

    return this
  }

  /**
   * Connect to database.
   */
  public static connect(options: ConnectionOptions = {}): void {
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

    this.isConnected = true
    this.isSavedOnFactory = options.saveOnFactory
  }

  /**
   * Close the connection with database in this instance.
   */
  public static async close(): Promise<void> {
    if (!this.isConnected) {
      return
    }

    this.tableName = null
    this.isConnected = false
  }

  /**
   * Creates a new instance of query builder.
   */
  public static query() {
    if (!this.isConnected) {
      throw new NotConnectedDatabaseException()
    }

    return {}
  }

  /**
   * Sync a model schema with database.
   */
  public static async sync(): Promise<void> {}

  /**
   * Create a new transaction.
   */
  public static async startTransaction(): Promise<Transaction> {
    return new Transaction(FakeDriver as any)
  }

  /**
   * Commit the transaction.
   */
  public static async commitTransaction(): Promise<void> {
    this.tableName = null
    this.client = null
    this.isConnected = false
  }

  /**
   * Rollback the transaction.
   */
  public static async rollbackTransaction(): Promise<void> {
    this.tableName = null
    this.client = null
    this.isConnected = false
  }

  /**
   * Run database migrations.
   */
  public static async runMigrations(): Promise<void> {}

  /**
   * Revert database migrations.
   */
  public static async revertMigrations(): Promise<void> {}

  /**
   * List all databases available.
   */
  public static async getDatabases(): Promise<string[]> {
    return this.databases
  }

  /**
   * Get the current database name.
   */
  public static async getCurrentDatabase(): Promise<string | undefined> {
    return this.databases[0]
  }

  /**
   * Verify if database exists.
   */
  public static async hasDatabase(database: string): Promise<boolean> {
    const databases = await this.getDatabases()

    return databases.includes(database)
  }

  /**
   * Create a new database.
   */
  public static async createDatabase(database: string): Promise<void> {
    this.databases.push(database)
  }

  /**
   * Drop some database.
   */
  public static async dropDatabase(database: string): Promise<void> {
    const index = this.databases.indexOf(database)

    this.databases.splice(index, 1)
  }

  /**
   * List all tables available.
   */
  public static async getTables(): Promise<string[]> {
    return this.tables
  }

  /**
   * Verify if table exists.
   */
  public static async hasTable(table: string): Promise<boolean> {
    const tables = await this.getTables()

    return tables.includes(table)
  }

  /**
   * Create a new table in database.
   */
  public static async createTable(table: string): Promise<void> {
    this.tables.push(table)
  }

  /**
   * Drop a table in database.
   */
  public static async dropTable(table: string): Promise<void> {
    const index = this.tables.indexOf(table)

    this.tables.splice(index, 1)
  }

  /**
   * Remove all data inside some database table
   * and restart the identity of the table.
   */
  public static async truncate(table: string): Promise<void> {
    this.tables.indexOf(table)
  }

  /**
   * Make a raw query in database.
   */
  public static raw(): any {
    return {}
  }

  /**
   * Calculate the average of a given column.
   */
  public static async avg() {
    return '1'
  }

  /**
   * Calculate the average of a given column using distinct.
   */
  public static async avgDistinct() {
    return '1'
  }

  /**
   * Get the max number of a given column.
   */
  public static async max() {
    return '1'
  }

  /**
   * Get the min number of a given column.
   */
  public static async min(): Promise<string> {
    return '1'
  }

  /**
   * Sum all numbers of a given column.
   */
  public static async sum(): Promise<string> {
    return '1'
  }

  /**
   * Sum all numbers of a given column in distinct mode.
   */
  public static async sumDistinct(): Promise<string> {
    return '1'
  }

  /**
   * Increment a value of a given column.
   */
  public static async increment(): Promise<void> {}

  /**
   * Decrement a value of a given column.
   */
  public static async decrement(): Promise<void> {}

  /**
   * Calculate the average of a given column using distinct.
   */
  public static async count(): Promise<string> {
    return '1'
  }

  /**
   * Calculate the average of a given column using distinct.
   */
  public static async countDistinct(): Promise<string> {
    return '1'
  }

  /**
   * Find a value in database.
   */
  public static async find(): Promise<any> {
    return {}
  }

  /**
   * Find a value in database or fail.
   */
  public static async findOrFail(): Promise<any> {
    const data = await this.find()

    if (!data) {
      throw new NotFoundDataException(this.connection)
    }

    return data
  }

  /**
   * Find a value in database or execute closure.
   */
  public static async findOr(): Promise<any> {
    return {}
  }

  /**
   * Executes the given closure when the first argument is true.
   */
  public static when(
    criteria: any,
    closure: (query: typeof FakeDriver, criteriaValue?: any) => void
  ) {
    if (!criteria) {
      return this
    }

    closure(this, criteria)

    return this
  }

  /**
   * Find many values in database.
   */
  public static async findMany(): Promise<any[]> {
    return [{}]
  }

  /**
   * Find many values in database and return as a Collection.
   */
  public static async collection(): Promise<Collection<any>> {
    return new Collection(await this.findMany())
  }

  /**
   * Find many values in database and return as paginated response.
   */
  public static async paginate<T = any>(
    page = 0,
    limit = 10,
    resourceUrl = '/'
  ): Promise<PaginatedResponse<T>> {
    return Exec.pagination([{}], 1, { page, limit, resourceUrl })
  }

  /**
   * Create a value in database.
   */
  public static async create<T = any>(data: Partial<T> = {}): Promise<T> {
    if (Is.Array(data)) {
      throw new WrongMethodException('create', 'createMany')
    }

    const created = await this.createMany([data])

    return created[0]
  }

  /**
   * Create many values in database.
   */
  public static async createMany<T = any>(
    data: Partial<T>[] = []
  ): Promise<T[]> {
    if (!Is.Array(data)) {
      throw new WrongMethodException('createMany', 'create')
    }

    return data as T[]
  }

  /**
   * Create data or update if already exists.
   */
  public static async createOrUpdate<T = any>(
    data: Partial<T> = {}
  ): Promise<T | T[]> {
    return data as T
  }

  /**
   * Update a value in database.
   */
  public static async update<T = any>(data: Partial<T>): Promise<T | T[]> {
    return data as T
  }

  /**
   * Delete one value in database.
   */
  public static async delete(): Promise<void> {}

  /**
   * Set the table that this query will be executed.
   */
  public static table(table: string) {
    if (!this.isConnected) {
      throw new NotConnectedDatabaseException()
    }

    this.tableName = table

    return this
  }

  /**
   * Log in console the actual query built.
   */
  public static dump() {
    return this
  }

  /**
   * Set the columns that should be selected on query.
   */
  public static select(...columns: string[]) {
    if (columns.includes('*')) {
      return this
    }

    return this
  }

  /**
   * Set the columns that should be selected on query raw.
   */
  public static selectRaw() {
    return this
  }

  /**
   * Set the table that should be used on query.
   * Different from `table()` method, this method
   * doesn't change the driver table.
   */
  public static from() {
    return this
  }

  /**
   * Set the table that should be used on query raw.
   * Different from `table()` method, this method
   * doesn't change the driver table.
   */
  public static fromRaw() {
    return this
  }

  /**
   * Set a join statement in your query.
   */
  public static join() {
    return this
  }

  /**
   * Set a left join statement in your query.
   */
  public static leftJoin() {
    return this
  }

  /**
   * Set a right join statement in your query.
   */
  public static rightJoin() {
    return this
  }

  /**
   * Set a cross join statement in your query.
   */
  public static crossJoin() {
    return this
  }

  /**
   * Set a full outer join statement in your query.
   */
  public static fullOuterJoin() {
    return this
  }

  /**
   * Set a left outer join statement in your query.
   */
  public static leftOuterJoin() {
    return this
  }

  /**
   * Set a right outer join statement in your query.
   */
  public static rightOuterJoin() {
    return this
  }

  /**
   * Set a join raw statement in your query.
   */
  public static joinRaw() {
    return this
  }

  /**
   * Set a group by statement in your query.
   */
  public static groupBy() {
    return this
  }

  /**
   * Set a group by raw statement in your query.
   */
  public static groupByRaw() {
    return this
  }

  public static having(column: string): typeof FakeDriver
  public static having(column: string, value: any): typeof FakeDriver
  public static having(
    column: string,
    operation: Operations,
    value: any
  ): typeof FakeDriver

  /**
   * Set a having statement in your query.
   */
  public static having() {
    return this
  }

  /**
   * Set a having raw statement in your query.
   */
  public static havingRaw() {
    return this
  }

  /**
   * Set a having exists statement in your query.
   */
  public static havingExists() {
    return this
  }

  /**
   * Set a having not exists statement in your query.
   */
  public static havingNotExists() {
    return this
  }

  /**
   * Set a having in statement in your query.
   */
  public static havingIn() {
    return this
  }

  /**
   * Set a having not in statement in your query.
   */
  public static havingNotIn() {
    return this
  }

  /**
   * Set a having between statement in your query.
   */
  public static havingBetween() {
    return this
  }

  /**
   * Set a having not between statement in your query.
   */
  public static havingNotBetween() {
    return this
  }

  /**
   * Set a having null statement in your query.
   */
  public static havingNull() {
    return this
  }

  /**
   * Set a having not null statement in your query.
   */
  public static havingNotNull() {
    return this
  }

  public static orHaving(column: string): typeof FakeDriver
  public static orHaving(column: string, value: any): typeof FakeDriver
  public static orHaving(
    column: string,
    operation: Operations,
    value: any
  ): typeof FakeDriver

  /**
   * Set an or having statement in your query.
   */
  public static orHaving() {
    return this
  }

  /**
   * Set an or having raw statement in your query.
   */
  public static orHavingRaw() {
    return this
  }

  /**
   * Set an or having exists statement in your query.
   */
  public static orHavingExists() {
    return this
  }

  /**
   * Set an or having not exists statement in your query.
   */
  public static orHavingNotExists() {
    return this
  }

  /**
   * Set an or having in statement in your query.
   */
  public static orHavingIn() {
    return this
  }

  /**
   * Set an or having not in statement in your query.
   */
  public static orHavingNotIn() {
    return this
  }

  /**
   * Set an or having between statement in your query.
   */
  public static orHavingBetween() {
    return this
  }

  /**
   * Set an or having not between statement in your query.
   */
  public static orHavingNotBetween() {
    return this
  }

  /**
   * Set an or having null statement in your query.
   */
  public static orHavingNull() {
    return this
  }

  /**
   * Set an or having not null statement in your query.
   */
  public static orHavingNotNull() {
    return this
  }

  public static where(statement: Record<string, any>): typeof FakeDriver
  public static where(key: string, value: any): typeof FakeDriver
  public static where(
    key: string,
    operation: Operations,
    value: any
  ): typeof FakeDriver

  /**
   * Set a where statement in your query.
   */
  public static where() {
    return this
  }

  public static whereNot(statement: Record<string, any>)
  public static whereNot(key: string, value: any)

  /**
   * Set a where not statement in your query.
   */
  public static whereNot() {
    return this
  }

  /**
   * Set a where raw statement in your query.
   */
  public static whereRaw() {
    return this
  }

  /**
   * Set a where exists statement in your query.
   */
  public static whereExists() {
    return this
  }

  /**
   * Set a where not exists statement in your query.
   */
  public static whereNotExists() {
    return this
  }

  /**
   * Set a where like statement in your query.
   */
  public static whereLike() {
    return this
  }

  /**
   * Set a where ILike statement in your query.
   */
  public static whereILike() {
    return this
  }

  /**
   * Set a where in statement in your query.
   */
  public static whereIn() {
    return this
  }

  /**
   * Set a where not in statement in your query.
   */
  public static whereNotIn() {
    return this
  }

  /**
   * Set a where between statement in your query.
   */
  public static whereBetween() {
    return this
  }

  /**
   * Set a where not between statement in your query.
   */
  public static whereNotBetween() {
    return this
  }

  /**
   * Set a where null statement in your query.
   */
  public static whereNull() {
    return this
  }

  /**
   * Set a where not null statement in your query.
   */
  public static whereNotNull() {
    return this
  }

  public static orWhere(statement: Record<string, any>): typeof FakeDriver
  public static orWhere(key: string, value: any): typeof FakeDriver
  public static orWhere(
    key: string,
    operation: Operations,
    value: any
  ): typeof FakeDriver

  /**
   * Set a or where statement in your query.
   */
  public static orWhere() {
    return this
  }

  public static orWhereNot(statement: Record<string, any>): typeof FakeDriver
  public static orWhereNot(key: string, value: any): typeof FakeDriver
  /**
   * Set an or where not statement in your query.
   */
  public static orWhereNot() {
    return this
  }

  /**
   * Set a or where raw statement in your query.
   */
  public static orWhereRaw() {
    return this
  }

  /**
   * Set an or where exists statement in your query.
   */
  public static orWhereExists() {
    return this
  }

  /**
   * Set an or where not exists statement in your query.
   */
  public static orWhereNotExists() {
    return this
  }

  /**
   * Set an or where like statement in your query.
   */
  public static orWhereLike() {
    return this
  }

  /**
   * Set an or where ILike statement in your query.
   */
  public static orWhereILike() {
    return this
  }

  /**
   * Set an or where in statement in your query.
   */
  public static orWhereIn() {
    return this
  }

  /**
   * Set an or where not in statement in your query.
   */
  public static orWhereNotIn() {
    return this
  }

  /**
   * Set an or where between statement in your query.
   */
  public static orWhereBetween() {
    return this
  }

  /**
   * Set an or where not between statement in your query.
   */
  public static orWhereNotBetween() {
    return this
  }

  /**
   * Set an or where null statement in your query.
   */
  public static orWhereNull() {
    return this
  }

  /**
   * Set an or where not null statement in your query.
   */
  public static orWhereNotNull() {
    return this
  }

  /**
   * Set an order by statement in your query.
   */
  public static orderBy() {
    return this
  }

  /**
   * Set an order by raw statement in your query.
   */
  public static orderByRaw() {
    return this
  }

  /**
   * Order the results easily by the latest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   */
  public static latest() {
    return this
  }

  /**
   * Order the results easily by the oldest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   */
  public static oldest() {
    return this
  }

  /**
   * Set the skip number in your query.
   */
  public static offset() {
    return this
  }

  /**
   * Set the limit number in your query.
   */
  public static limit() {
    return this
  }
}
