/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Collection, Exec, Is } from '@athenna/common'

import { Transaction } from '#src/Database/Transactions/Transaction'
import { DriverFactory } from '#src/Factories/DriverFactory'
import { MigrationSource } from '#src/Database/Migrations/MigrationSource'
import { WrongMethodException } from '#src/Exceptions/WrongMethodException'
import { NotFoundDataException } from '#src/Exceptions/NotFoundDataException'
import { PROTECTED_QUERY_METHODS } from '#src/Constants/ProtectedQueryMethods'
import { NotConnectedDatabaseException } from '#src/Exceptions/NotConnectedDatabaseException'

export class PostgresDriver {
  /**
   * Set if this instance is connected with database.
   *
   * @type {boolean}
   */
  #isConnected = false

  /**
   * Set if the connection will be saved on factory.
   *
   * @type {boolean}
   */
  #isSavedOnFactory = true

  /**
   * The connection name used for this instance.
   *
   * @type {string|null}
   */
  #connection = null

  /**
   * Set the table that this instance will work with.
   *
   * @type {string|null}
   */
  #table = null

  /**
   * Set the client of this driver.
   *
   * @type {import('knex').Knex|import('knex').Knex.Transaction|null}
   */
  #client = null

  /**
   * The main query builder of driver.
   *
   * @type {import('knex').Knex.QueryBuilder|null}
   */
  #qb = null

  /**
   * Creates a new instance of PostgresDriver.
   *
   * @param {string|any} connection
   * @param {any} [client]
   * @return {Database}
   */
  constructor(connection, client = null) {
    this.#connection = connection

    if (client) {
      this.#isConnected = true
      this.#isSavedOnFactory = true
      this.#client = client
    }
  }

  /**
   * Return the client of driver.
   *
   * @return {import('knex').Knex|null}
   */
  getClient() {
    return this.#client
  }

  /**
   * Return the query builder of driver.
   *
   * @return {import('knex').Knex.QueryBuilder|null}
   */
  getQueryBuilder() {
    return this.#qb
  }

  /**
   * Connect to database.
   *
   * @param {boolean} force
   * @param {boolean} saveOnFactory
   * @return {Promise<void>}
   */
  async connect(force = false, saveOnFactory = true) {
    if (this.#isConnected && !force) {
      return
    }

    this.#client = await DriverFactory.createConnectionByDriver(
      'postgres',
      this.#connection,
      saveOnFactory,
    )

    this.#isConnected = true
    this.#isSavedOnFactory = saveOnFactory

    this.#qb = this.query()
  }

  /**
   * Close the connection with database in this instance.
   *
   * @return {Promise<void>}
   */
  async close() {
    if (!this.#isConnected) {
      return
    }

    if (this.#isSavedOnFactory) {
      await DriverFactory.closeConnectionByDriver('postgres')
    } else {
      await this.#client.destroy()
    }

    this.#qb = null
    this.#table = null
    this.#client = null
    this.#isConnected = false
  }

  /**
   * Creates a new instance of query builder.
   *
   * @return {import('knex').Knex.QueryBuilder}
   */
  query() {
    if (!this.#isConnected) {
      throw new NotConnectedDatabaseException()
    }

    const query = this.#client.queryBuilder().table(this.#table)

    const handler = {
      get: (target, propertyKey) => {
        if (PROTECTED_QUERY_METHODS.includes(propertyKey)) {
          this.#qb = this.query()
        }

        return target[propertyKey]
      },
    }

    return new Proxy(query, handler)
  }

  /**
   * Create a new transaction.
   *
   * @return {Promise<Transaction>}
   */
  async startTransaction() {
    return new Transaction(
      new PostgresDriver(this.#connection, await this.#client.transaction()),
    )
  }

  /**
   * Commit the transaction.
   *
   * @return {Promise<void>}
   */
  async commitTransaction() {
    await this.#client.commit()

    this.#table = null
    this.#client = null
    this.#isConnected = false
  }

  /**
   * Rollback the transaction.
   *
   * @return {Promise<void>}
   */
  async rollbackTransaction() {
    await this.#client.rollback()

    this.#table = null
    this.#client = null
    this.#isConnected = false
  }

  /**
   * Run database migrations.
   *
   * @return {Promise<void>}
   */
  async runMigrations() {
    await this.#client.migrate.latest({
      migrationSource: new MigrationSource(this.#connection),
    })
  }

  /**
   * Revert database migrations.
   *
   * @return {Promise<void>}
   */
  async revertMigrations() {
    await this.#client.migrate.rollback({
      migrationSource: new MigrationSource(this.#connection),
    })
  }

  /**
   * List all databases available.
   *
   * @return {Promise<string[]>}
   */
  async getDatabases() {
    const { rows: databases } = await this.raw(
      'SELECT datname FROM pg_database',
    )

    return databases.map(database => database.datname)
  }

  /**
   * Get the current database name.
   *
   * @return {Promise<string | undefined>}
   */
  async getCurrentDatabase() {
    return this.#client.client.database()
  }

  /**
   * Verify if database exists.
   *
   * @param {string} database
   * @return {Promise<boolean>}
   */
  async hasDatabase(database) {
    const databases = await this.getDatabases()

    return databases.includes(database)
  }

  /**
   * Create a new database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  async createDatabase(databaseName) {
    /**
     * Catching the error to simulate IF NOT EXISTS
     */
    try {
      await this.raw('CREATE DATABASE ??', databaseName)
    } catch (err) {}
  }

  /**
   * Drop some database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  async dropDatabase(databaseName) {
    /**
     * Catching the error to simulate IF EXISTS
     */
    try {
      await this.raw('DROP DATABASE ??', databaseName)
    } catch (err) {}
  }

  /**
   * List all tables available.
   *
   * @return {Promise<string[]>}
   */
  async getTables() {
    const { rows: tables } = await this.raw(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_catalog = ?',
      await this.getCurrentDatabase(),
    )

    return tables.map(table => table.table_name)
  }

  /**
   * Verify if table exists.
   *
   * @param {string} table
   * @return {Promise<boolean>}
   */
  async hasTable(table) {
    return this.#client.schema.hasTable(table)
  }

  /**
   * Create a new table in database.
   *
   * @param {string} tableName
   * @param {(builder: import('knex').Knex.TableBuilder) => void|Promise<void>} callback
   * @return {Promise<void>}
   */
  async createTable(tableName, callback) {
    await this.#client.schema.createTable(tableName, callback)
  }

  /**
   * Drop a table in database.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  async dropTable(tableName) {
    await this.#client.schema.dropTableIfExists(tableName)
  }

  /**
   * Remove all data inside some database table
   * and restart the identity of the table.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  async truncate(tableName) {
    await this.raw('TRUNCATE TABLE ?? CASCADE', tableName)
  }

  /**
   * Make a raw query in database.
   *
   * @param {string} raw
   * @param {any} [queryValues]
   * @return {Promise<any>}
   */
  async raw(raw, ...queryValues) {
    return this.#client.raw(raw, ...queryValues)
  }

  /**
   * Calculate the average of a given column.
   *
   * @param {string} column
   * @return {Promise<string>}
   */
  async avg(column) {
    const [{ avg }] = await this.#qb.avg({ avg: column })

    return avg
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<string>}
   */
  async avgDistinct(column) {
    const [{ avg }] = await this.#qb.avgDistinct({ avg: column })

    return avg
  }

  /**
   * Get the max number of a given column.
   *
   * @param {string} column
   * @return {Promise<string>}
   */
  async max(column) {
    const [{ max }] = await this.#qb.max({ max: column })

    return max
  }

  /**
   * Get the min number of a given column.
   *
   * @param {string} column
   * @return {Promise<string>}
   */
  async min(column) {
    const [{ min }] = await this.#qb.min({ min: column })

    return min
  }

  /**
   * Sum all numbers of a given column.
   *
   * @param {string} column
   * @return {Promise<string>}
   */
  async sum(column) {
    const [{ sum }] = await this.#qb.sum({ sum: column })

    return sum
  }

  /**
   * Sum all numbers of a given column in distinct mode.
   *
   * @param {string} column
   * @return {Promise<string>}
   */
  async sumDistinct(column) {
    const [{ sum }] = await this.#qb.sumDistinct({ sum: column })

    return sum
  }

  /**
   * Increment a value of a given column.
   *
   * @param {string} column
   * @return {Promise<void>}
   */
  async increment(column) {
    return this.#qb.increment(column)
  }

  /**
   * Decrement a value of a given column.
   *
   * @param {string} column
   * @return {Promise<void>}
   */
  async decrement(column) {
    return this.#qb.decrement(column)
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async count(column = '*') {
    const [{ count }] = await this.#qb.count({ count: column })

    return count
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async countDistinct(column) {
    const [{ count }] = await this.#qb.countDistinct({ count: column })

    return count
  }

  /**
   * Find a value in database or throw exception if undefined.
   *
   * @return {Promise<any>}
   */
  async findOrFail() {
    const data = await this.find()

    if (!data) {
      throw new NotFoundDataException(this.#connection)
    }

    return data
  }

  /**
   * Find a value in database.
   *
   * @return {Promise<any>}
   */
  async find() {
    return this.#qb.first()
  }

  /**
   * Find many values in database.
   *
   * @return {Promise<any>}
   */
  async findMany() {
    const data = await this.#qb

    this.#qb = this.query()

    return data
  }

  /**
   * Find many values in database and return as a Collection.
   *
   * @return {Promise<Collection>}
   */
  async collection() {
    return new Collection(await this.findMany())
  }

  /**
   * Find many values in database and return as paginated response.
   *
   * @param [page] {boolean}
   * @param [limit] {boolean}
   * @param [resourceUrl] {string}
   * @return {Promise<import('@athenna/common').PaginatedResponse>}
   */
  async paginate(page = 0, limit = 10, resourceUrl = '/') {
    const [{ count }] = await this.#qb
      .clone()
      .clearOrder()
      .clearSelect()
      .count({ count: '*' })

    const data = await this.offset(page).limit(limit).findMany()

    return Exec.pagination(data, parseInt(count), { page, limit, resourceUrl })
  }

  /**
   * Create a value in database.
   *
   * @param {any} data
   * @param {string} [primaryKey]
   * @return {Promise<any>}
   */
  async create(data, primaryKey = 'id') {
    if (Is.Array(data)) {
      throw new WrongMethodException('create', 'createMany')
    }

    const created = await this.createMany([data], primaryKey)

    return created[0]
  }

  /**
   * Create many values in database.
   *
   * @param {any[]} data
   * @param {string} [primaryKey]
   * @return {Promise<any>}
   */
  async createMany(data, primaryKey = 'id') {
    if (!Is.Array(data)) {
      throw new WrongMethodException('createMany', 'create')
    }

    return this.#qb.insert(data, '*')
  }

  /**
   * Create data or update if already exists.
   *
   * @param {any | any[]} data
   * @param {string} [primaryKey]
   * @return {Promise<any | any[]>}
   */
  async createOrUpdate(data, primaryKey = 'id') {
    const query = this.#qb.clone()
    const hasValue = await query.first()

    if (hasValue) {
      await this.#qb.where(primaryKey, hasValue[primaryKey]).update(data)

      return this.where(primaryKey, hasValue[primaryKey]).find()
    }

    return this.create(data, primaryKey)
  }

  /**
   * Update a value in database.
   *
   * @param {any} data
   * @param {boolean} [force]
   * @return {Promise<any>}
   */
  async update(data, force = false) {
    await this.#qb.clone().update(data)

    const result = await this.findMany()

    if (result.length === 1) {
      return result[0]
    }

    return result
  }

  /**
   * Delete one value in database.
   *
   * @return {Promise<void>}
   */
  async delete() {
    await this.#qb.delete()
  }

  /**
   * Set the table that this query will be executed.
   *
   * @param tableName {string|any}
   * @return {PostgresDriver}
   */
  table(tableName) {
    if (!this.#isConnected) {
      throw new NotConnectedDatabaseException()
    }

    this.#table = tableName
    this.#qb = this.query()

    return this
  }

  /**
   * Log in console the actual query built.
   *
   * @return {PostgresDriver}
   */
  dump() {
    console.log(this.#qb.toSQL().toNative())

    return this
  }

  /**
   * Executes the given closure when the first argument is true.
   *
   * @param criteria {any}
   * @param callback {(query: PostgresDriver, criteriaValue: any) => void}
   */
  when(criteria, callback) {
    if (!criteria) {
      return this
    }

    // eslint-disable-next-line n/no-callback-literal
    callback(this, criteria)

    return this
  }

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {PostgresDriver}
   */
  select(...columns) {
    this.#qb.select(...columns)

    return this
  }

  /**
   * Set a join statement in your query.
   *
   * @param tableName {string}
   * @param column1 {string}
   * @param [operation] {string}
   * @param column2 {string}
   * @param joinType {string}
   * @return {PostgresDriver}
   */
  join(tableName, column1, operation = '=', column2, joinType = 'join') {
    if (operation && !column2) {
      this.#qb[joinType](tableName, column1, operation)

      return this
    }

    this.#qb[joinType](tableName, column1, operation, column2)

    return this
  }

  /**
   * Set a join raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {PostgresDriver}
   */
  joinRaw(sql, bindings) {
    this.#qb.joinRaw(sql, bindings)

    return this
  }

  /**
   * Set a group by statement in your query.
   *
   * @param columns {string}
   * @return {PostgresDriver}
   */
  groupBy(...columns) {
    this.#qb.groupBy(...columns)

    return this
  }

  /**
   * Set a group by raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {PostgresDriver}
   */
  groupByRaw(sql, bindings) {
    this.#qb.groupByRaw(sql, bindings)

    return this
  }

  /**
   * Set a having statement in your query.
   *
   * @param column {string}
   * @param [operation] {string|any}
   * @param [value] {any}
   * @return {PostgresDriver}
   */
  having(column, operation, value) {
    if (value === undefined) {
      this.#qb.having(column, '=', operation)

      return this
    }

    this.#qb.having(column, operation, value)

    return this
  }

  /**
   * Set a having raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {PostgresDriver}
   */
  havingRaw(sql, bindings) {
    this.#qb.havingRaw(sql, bindings)

    return this
  }

  /**
   * Set a having exists statement in your query.
   *
   * @param builder {import('#src/Database/Builders/QueryBuilder')}
   * @return {PostgresDriver}
   */
  havingExists(builder) {
    this.#qb.havingExists(builder.getQueryBuilder())

    return this
  }

  /**
   * Set a having not exists statement in your query.
   *
   * @param builder {import('#src/Database/Builders/QueryBuilder')}
   * @return {PostgresDriver}
   */
  havingNotExists(builder) {
    this.#qb.havingNotExists(builder.getQueryBuilder())

    return this
  }

  /**
   * Set a having in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {PostgresDriver}
   */
  havingIn(columnName, values) {
    this.#qb.havingIn(columnName, values)

    return this
  }

  /**
   * Set a having not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {PostgresDriver}
   */
  havingNotIn(columnName, values) {
    this.#qb.havingNotIn(columnName, values)

    return this
  }

  /**
   * Set a having between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {PostgresDriver}
   */
  havingBetween(columnName, values) {
    this.#qb.havingBetween(columnName, values)

    return this
  }

  /**
   * Set a having not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {PostgresDriver}
   */
  havingNotBetween(columnName, values) {
    this.#qb.havingNotBetween(columnName, values)

    return this
  }

  /**
   * Set a having null statement in your query.
   *
   * @param columnName {string}
   * @return {PostgresDriver}
   */
  havingNull(columnName) {
    this.#qb.havingNull(columnName)

    return this
  }

  /**
   * Set a having not null statement in your query.
   *
   * @param columnName {string}
   * @return {PostgresDriver}
   */
  havingNotNull(columnName) {
    this.#qb.havingNotNull(columnName)

    return this
  }

  /**
   * Set an or having statement in your query.
   *
   * @param column {string}
   * @param [operation] {string|any}
   * @param [value] {any}
   * @return {PostgresDriver}
   */
  orHaving(column, operation, value) {
    if (value === undefined) {
      this.#qb.orHaving(column, '=', operation)

      return this
    }

    this.#qb.orHaving(column, operation, value)

    return this
  }

  /**
   * Set an or having raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {PostgresDriver}
   */
  orHavingRaw(sql, bindings) {
    this.#qb.orHavingRaw(sql, bindings)

    return this
  }

  /**
   * Set an or having exists statement in your query.
   *
   * @param builder {import('#src/Database/Builders/QueryBuilder')}
   * @return {PostgresDriver}
   */
  orHavingExists(builder) {
    this.#qb.orHavingExists(builder.getQueryBuilder())

    return this
  }

  /**
   * Set an or having not exists statement in your query.
   *
   * @param builder {import('#src/Database/Builders/QueryBuilder')}
   * @return {PostgresDriver}
   */
  orHavingNotExists(builder) {
    this.#qb.orHavingNotExists(builder.getQueryBuilder())

    return this
  }

  /**
   * Set an or having in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {PostgresDriver}
   */
  orHavingIn(columnName, values) {
    this.#qb.orHavingIn(columnName, values)

    return this
  }

  /**
   * Set an or having not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {PostgresDriver}
   */
  orHavingNotIn(columnName, values) {
    this.#qb.orHavingNotIn(columnName, values)

    return this
  }

  /**
   * Set an or having between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {PostgresDriver}
   */
  orHavingBetween(columnName, values) {
    this.#qb.orHavingBetween(columnName, values)

    return this
  }

  /**
   * Set an or having not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {PostgresDriver}
   */
  orHavingNotBetween(columnName, values) {
    this.#qb.orHavingNotBetween(columnName, values)

    return this
  }

  /**
   * Set an or having null statement in your query.
   *
   * @param columnName {string}
   * @return {PostgresDriver}
   */
  orHavingNull(columnName) {
    this.#qb.orHavingNull(columnName)

    return this
  }

  /**
   * Set an or having not null statement in your query.
   *
   * @param columnName {string}
   * @return {PostgresDriver}
   */
  orHavingNotNull(columnName) {
    this.#qb.orHavingNotNull(columnName)

    return this
  }

  /**
   * Set a where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [operation] {string|Record<string, any>}
   * @param [value] {Record<string, any>}
   * @return {PostgresDriver}
   */
  where(statement, operation, value) {
    if (operation === undefined) {
      this.#qb.where(statement)

      return this
    }

    if (value === undefined) {
      this.#qb.where(statement, operation)

      return this
    }

    this.#qb.where(statement, operation, value)

    return this
  }

  /**
   * Set a where not statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {PostgresDriver}
   */
  whereNot(statement, value) {
    if (value === undefined) {
      this.#qb.whereNot(statement)

      return this
    }

    this.#qb.whereNot(statement, value)

    return this
  }

  /**
   * Set a where raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {PostgresDriver}
   */
  whereRaw(sql, bindings) {
    this.#qb.whereRaw(sql, bindings)

    return this
  }

  /**
   * Set a where exists statement in your query.
   *
   * @param builder {import('#src/Database/Builders/QueryBuilder')}
   * @return {PostgresDriver}
   */
  whereExists(builder) {
    this.#qb.whereExists(builder.getQueryBuilder())

    return this
  }

  /**
   * Set a where not exists statement in your query.
   *
   * @param builder {import('#src/Database/Builders/QueryBuilder')}
   * @return {PostgresDriver}
   */
  whereNotExists(builder) {
    this.#qb.whereNotExists(builder.getQueryBuilder())

    return this
  }

  /**
   * Set a where like statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {PostgresDriver}
   */
  whereLike(statement, value) {
    if (value === undefined) {
      this.#qb.whereLike(statement)

      return this
    }

    this.#qb.whereLike(statement, value)

    return this
  }

  /**
   * Set a where ILike statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {PostgresDriver}
   */
  whereILike(statement, value) {
    if (value === undefined) {
      this.#qb.whereILike(statement)

      return this
    }

    this.#qb.whereILike(statement, value)

    return this
  }

  /**
   * Set a where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {PostgresDriver}
   */
  whereIn(columnName, values) {
    this.#qb.whereIn(columnName, values)

    return this
  }

  /**
   * Set a where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {PostgresDriver}
   */
  whereNotIn(columnName, values) {
    this.#qb.whereNotIn(columnName, values)

    return this
  }

  /**
   * Set a where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {PostgresDriver}
   */
  whereBetween(columnName, values) {
    this.#qb.whereBetween(columnName, values)

    return this
  }

  /**
   * Set a where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {PostgresDriver}
   */
  whereNotBetween(columnName, values) {
    this.#qb.whereNotBetween(columnName, values)

    return this
  }

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {PostgresDriver}
   */
  whereNull(columnName) {
    this.#qb.whereNull(columnName)

    return this
  }

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {PostgresDriver}
   */
  whereNotNull(columnName) {
    this.#qb.whereNotNull(columnName)

    return this
  }

  /**
   * Set a or where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [operation] {string|Record<string, any>}
   * @param [value] {Record<string, any>}
   * @return {PostgresDriver}
   */
  orWhere(statement, operation, value) {
    if (operation === undefined) {
      this.#qb.orWhere(statement)

      return this
    }

    if (value === undefined) {
      this.#qb.orWhere(statement, operation)

      return this
    }

    this.#qb.orWhere(statement, operation, value)

    return this
  }

  /**
   * Set an or where not statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {PostgresDriver}
   */
  orWhereNot(statement, value) {
    if (value === undefined) {
      this.#qb.orWhereNot(statement)

      return this
    }

    this.#qb.orWhereNot(statement, value)

    return this
  }

  /**
   * Set a or where raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {PostgresDriver}
   */
  orWhereRaw(sql, bindings) {
    this.#qb.orWhereRaw(sql, bindings)

    return this
  }

  /**
   * Set an or where exists statement in your query.
   *
   * @param builder {import('#src/Database/Builders/QueryBuilder')}
   * @return {PostgresDriver}
   */
  orWhereExists(builder) {
    this.#qb.orWhereExists(builder.getQueryBuilder())

    return this
  }

  /**
   * Set an or where not exists statement in your query.
   *
   * @param builder {import('#src/Database/Builders/QueryBuilder')}
   * @return {PostgresDriver}
   */
  orWhereNotExists(builder) {
    this.#qb.orWhereNotExists(builder.getQueryBuilder())

    return this
  }

  /**
   * Set an or where like statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {PostgresDriver}
   */
  orWhereLike(statement, value) {
    if (value === undefined) {
      this.#qb.orWhereLike(statement)

      return this
    }

    this.#qb.orWhereLike(statement, value)

    return this
  }

  /**
   * Set an or where ILike statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {PostgresDriver}
   */
  orWhereILike(statement, value) {
    if (value === undefined) {
      this.#qb.orWhereILike(statement)

      return this
    }

    this.#qb.orWhereILike(statement, value)

    return this
  }

  /**
   * Set an or where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {PostgresDriver}
   */
  orWhereIn(columnName, values) {
    this.#qb.orWhereIn(columnName, values)

    return this
  }

  /**
   * Set an or where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {PostgresDriver}
   */
  orWhereNotIn(columnName, values) {
    this.#qb.orWhereNotIn(columnName, values)

    return this
  }

  /**
   * Set an or where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {PostgresDriver}
   */
  orWhereBetween(columnName, values) {
    this.#qb.orWhereBetween(columnName, values)

    return this
  }

  /**
   * Set an or where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {PostgresDriver}
   */
  orWhereNotBetween(columnName, values) {
    this.#qb.orWhereNotBetween(columnName, values)

    return this
  }

  /**
   * Set an or where null statement in your query.
   *
   * @param columnName {string}
   * @return {PostgresDriver}
   */
  orWhereNull(columnName) {
    this.#qb.orWhereNull(columnName)

    return this
  }

  /**
   * Set an or where not null statement in your query.
   *
   * @param columnName {string}
   * @return {PostgresDriver}
   */
  orWhereNotNull(columnName) {
    this.#qb.orWhereNotNull(columnName)

    return this
  }

  /**
   * Set an order by statement in your query.
   *
   * @param columnName {string}
   * @param [direction] {'asc'|'desc'|'ASC'|'DESC'}
   * @return {PostgresDriver}
   */
  orderBy(columnName, direction = 'ASC') {
    this.#qb.orderBy(columnName, direction.toUpperCase())

    return this
  }

  /**
   * Set an order by raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {PostgresDriver}
   */
  orderByRaw(sql, bindings) {
    this.#qb.orderByRaw(sql, bindings)

    return this
  }

  /**
   * Order the results easily by the latest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   *
   * @param [columnName] {string}
   * @return {PostgresDriver}
   */
  latest(columnName = 'createdAt') {
    return this.orderBy(columnName, 'DESC')
  }

  /**
   * Order the results easily by the oldest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   *
   * @param [columnName] {string}
   * @return {PostgresDriver}
   */
  oldest(columnName = 'createdAt') {
    return this.orderBy(columnName, 'ASC')
  }

  /**
   * Set the skip number in your query.
   *
   * @param number {number}
   * @return {PostgresDriver}
   */
  offset(number) {
    this.#qb.offset(number)

    return this
  }

  /**
   * Set the limit number in your query.
   *
   * @param number {number}
   * @return {PostgresDriver}
   */
  limit(number) {
    this.#qb.limit(number)

    return this
  }
}
