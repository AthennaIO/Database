/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path, Config } from '@secjs/utils'

import { DriverFactory } from '#src/Factories/DriverFactory'

export class Database {
  /**
   * The runtime configurations for this instance.
   *
   * @type {any}
   */
  #configs = {}

  /**
   * The connection name used for this instance.
   *
   * @type {string|null}
   */
  #connection = 'default'

  /**
   * The drivers responsible for handling database operations.
   *
   * @type {any}
   */
  #driver = null

  /**
   * Creates a new instance of Database.
   *
   * @param {any} configs
   * @return {Database}
   */
  constructor(configs = {}) {
    new Config().safeLoad(Path.config('database'))

    this.#configs = configs
    this.#driver = DriverFactory.fabricate(this.#connection, this.#configs)
  }

  /**
   * Change the database connection.
   *
   * @param {string} connection
   * @return {Database}
   */
  connection(connection) {
    this.#driver = DriverFactory.fabricate(connection, this.#configs)

    return this
  }

  /**
   * Connect to database.
   *
   * @param {boolean} force
   * @param {boolean} saveOnDriver
   * @return {Promise<void>}
   */
  async connect(force = false, saveOnDriver = true) {
    return this.#driver.connect(force, saveOnDriver)
  }

  /**
   * Close the connection with database in this instance.
   *
   * @return {Promise<void>}
   */
  async close() {
    return this.#driver.close()
  }

  /**
   * Return the TypeORM data source.
   *
   * @return {import('typeorm').DataSource|null}
   */
  getDataSource() {
    return this.#driver.getDataSource()
  }

  /**
   * Creates a new instance of query builder.
   *
   * @param fullQuery {boolean}
   * @return {any}
   */
  query(fullQuery = false) {
    return this.#driver.query(fullQuery)
  }

  /**
   * Create a new transaction.
   *
   * @return {Promise<Transaction>}
   */
  async startTransaction() {
    return this.#driver.startTransaction()
  }

  /**
   * List all databases available.
   *
   * @return {Promise<string[]>}
   */
  async getDatabases() {
    return this.#driver.getDatabases()
  }

  /**
   * Get the current database name.
   *
   * @return {Promise<string | undefined>}
   */
  async getCurrentDatabase() {
    return this.#driver.getCurrentDatabase()
  }

  /**
   * Verify if database exists.
   *
   * @param {string} database
   * @return {boolean}
   */
  async hasDatabase(database) {
    return this.#driver.hasDatabase(database)
  }

  /**
   * Create a new database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  async createDatabase(databaseName) {
    return this.#driver.createDatabase(databaseName)
  }

  /**
   * Drop some database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  async dropDatabase(databaseName) {
    return this.#driver.dropDatabase(databaseName)
  }

  /**
   * Get metadata information's about some database table.
   *
   * @param {string} table
   * @return {Promise<any>}
   */
  async getTable(table) {
    return this.#driver.getTable(table)
  }

  /**
   * List all tables available.
   *
   * @return {Promise<string[]>}
   */
  async getTables() {
    return this.#driver.getTables()
  }

  /**
   * Verify if table exists.
   *
   * @param {string} table
   * @return {boolean}
   */
  async hasTable(table) {
    return this.#driver.hasTable(table)
  }

  /**
   * Create a new table in database.
   *
   * @param {string} tableName
   * @param {any} options
   * @return {Promise<void>}
   */
  async createTable(tableName, options = {}) {
    return this.#driver.createTable(tableName, options)
  }

  /**
   * Drop a table in database.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  async dropTable(tableName) {
    return this.#driver.dropTable(tableName)
  }

  /**
   * Remove all data inside some database table
   * and restart the identity of the table.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  async truncate(tableName) {
    return this.#driver.truncate(tableName)
  }

  /**
   * Make a raw query in database.
   *
   * @param {string} raw
   * @param {any[]} [queryValues]
   * @return {Promise<any>}
   */
  async raw(raw, queryValues) {
    return this.#driver.raw(raw, queryValues)
  }

  /**
   * Calculate the average of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async avg(column) {
    return this.#driver.avg(column)
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async avgDistinct(column) {
    return this.#driver.avgDistinct(column)
  }

  /**
   * Get the max number of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async max(column) {
    return this.#driver.max(column)
  }

  /**
   * Get the min number of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async min(column) {
    return this.#driver.min(column)
  }

  /**
   * Sum all numbers of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async sum(column) {
    return this.#driver.sum(column)
  }

  /**
   * Sum all numbers of a given column in distinct mode.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async sumDistinct(column) {
    return this.#driver.sumDistinct(column)
  }

  /**
   * Increment a value of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async increment(column) {
    return this.#driver.increment(column)
  }

  /**
   * Decrement a value of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async decrement(column) {
    return this.#driver.decrement(column)
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async count(column = '*') {
    return this.#driver.count(column)
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async countDistinct(column = '*') {
    return this.#driver.countDistinct(column)
  }

  /**
   * Find a value in database.
   *
   * @return {Promise<any>}
   */
  async find() {
    return this.#driver.find()
  }

  /**
   * Find many values in database.
   *
   * @return {Promise<any>}
   */
  async findMany() {
    return this.#driver.findMany()
  }

  /**
   * Find many values in database and return as paginated response.
   *
   * @param [page] {boolean}
   * @param [limit] {boolean}
   * @param [resourceUrl] {string}
   * @return {Promise<import('@secjs/utils').PaginatedResponse>}
   */
  async paginate(page = 0, limit = 10, resourceUrl = '/') {
    return this.#driver.paginate(page, limit, resourceUrl)
  }

  /**
   * Create a value in database.
   *
   * @param {any} data
   * @return {Promise<any>}
   */
  async create(data) {
    return this.#driver.create(data)
  }

  /**
   * Create many values in database.
   *
   * @param {any[]} data
   * @return {Promise<any[]>}
   */
  async createMany(data) {
    return this.#driver.createMany(data)
  }

  /**
   * Update a value in database.
   *
   * @param {any} data
   * @return {Promise<any|any[]>}
   */
  async update(data) {
    return this.#driver.update(data)
  }

  /**
   * Delete one value in database.
   *
   * @return {Promise<any|any[]|void>}
   */
  async delete() {
    return this.#driver.delete()
  }

  /**
   * Set the table that this query will be executed.
   *
   * @param tableName {string|any}
   * @return {Database}
   */
  buildTable(tableName) {
    this.#driver.buildTable(tableName)

    return this
  }

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {Database}
   */
  buildSelect(...columns) {
    this.#driver.buildSelect(...columns)

    return this
  }

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {Database}
   */
  buildAddSelect(...columns) {
    this.#driver.buildAddSelect(...columns)

    return this
  }

  /**
   * Set a include statement in your query.
   *
   * @param relation {string|any}
   * @param [operation] {string}
   * @return {Database}
   */
  buildIncludes(relation, operation) {
    this.#driver.buildIncludes(relation, operation)

    return this
  }

  /**
   * Set a where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Database}
   */
  buildWhere(statement, value) {
    this.#driver.buildWhere(statement, value)

    return this
  }

  /**
   * Set a where like statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Database}
   */
  buildWhereLike(statement, value) {
    this.#driver.buildWhereLike(statement, value)

    return this
  }

  /**
   * Set a where ILike statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Database}
   */
  buildWhereILike(statement, value) {
    this.#driver.buildWhereILike(statement, value)

    return this
  }

  /**
   * Set a where not statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Database}
   */
  buildWhereNot(statement, value) {
    this.#driver.buildWhereNot(statement, value)

    return this
  }

  /**
   * Set a where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {Database}
   */
  buildWhereIn(columnName, values) {
    this.#driver.buildWhereIn(columnName, values)

    return this
  }

  /**
   * Set a where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {Database}
   */
  buildWhereNotIn(columnName, values) {
    this.#driver.buildWhereNotIn(columnName, values)

    return this
  }

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {Database}
   */
  buildWhereNull(columnName) {
    this.#driver.buildWhereNull(columnName)

    return this
  }

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {Database}
   */
  buildWhereNotNull(columnName) {
    this.#driver.buildWhereNotNull(columnName)

    return this
  }

  /**
   * Set a where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {Database}
   */
  buildWhereBetween(columnName, values) {
    this.#driver.buildWhereBetween(columnName, values)

    return this
  }

  /**
   * Set a where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {Database}
   */
  buildWhereNotBetween(columnName, values) {
    this.#driver.buildWhereNotBetween(columnName, values)

    return this
  }

  /**
   * Set a order by statement in your query.
   *
   * @param columnName {string}
   * @param [direction] {'asc'|'desc'|'ASC'|'DESC'}
   * @return {Database}
   */
  buildOrderBy(columnName, direction = 'ASC') {
    this.#driver.buildOrderBy(columnName, direction)

    return this
  }

  /**
   * Set the skip number in your query.
   *
   * @param number {number}
   * @return {Database}
   */
  buildSkip(number) {
    this.#driver.buildSkip(number)

    return this
  }

  /**
   * Set the limit number in your query.
   *
   * @param number {number}
   * @return {Database}
   */
  buildLimit(number) {
    this.#driver.buildLimit(number)

    return this
  }
}

export class Transaction {
  /**
   * The drivers responsible for handling database operations.
   *
   * @type {any}
   */
  #driver = null

  /**
   * Creates a new instance of transaction.
   *
   * @param {any} driver
   * @return {Database}
   */
  constructor(driver) {
    this.#driver = driver
  }

  /**
   * Creates a new instance of query builder.
   *
   * @param fullQuery {boolean}
   * @return {any}
   */
  query(fullQuery = false) {
    return this.#driver.query(fullQuery)
  }

  /**
   * Commit the transaction.
   *
   * @return {Promise<void>}
   */
  async commitTransaction() {
    return this.#driver.commitTransaction()
  }

  /**
   * Rollback the transaction.
   *
   * @return {Promise<void>}
   */
  async rollbackTransaction() {
    return this.#driver.rollbackTransaction()
  }

  /**
   * List all databases available.
   *
   * @return {Promise<string[]>}
   */
  async getDatabases() {
    return this.#driver.getDatabases()
  }

  /**
   * Get the current database name.
   *
   * @return {Promise<string | undefined>}
   */
  async getCurrentDatabase() {
    return this.#driver.getCurrentDatabase()
  }

  /**
   * Verify if database exists.
   *
   * @param {string} database
   * @return {boolean}
   */
  async hasDatabase(database) {
    return this.#driver.hasDatabase(database)
  }

  /**
   * Create a new database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  async createDatabase(databaseName) {
    return this.#driver.createDatabase(databaseName)
  }

  /**
   * Drop some database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  async dropDatabase(databaseName) {
    return this.#driver.dropDatabase(databaseName)
  }

  /**
   * Get metadata information's about some database table.
   *
   * @param {string} table
   * @return {Promise<any>}
   */
  async getTable(table) {
    return this.#driver.getTable(table)
  }

  /**
   * List all tables available.
   *
   * @return {Promise<string[]>}
   */
  async getTables() {
    return this.#driver.getTables()
  }

  /**
   * Verify if table exists.
   *
   * @param {string} table
   * @return {boolean}
   */
  async hasTable(table) {
    return this.#driver.hasTable(table)
  }

  /**
   * Create a new table in database.
   *
   * @param {string} tableName
   * @param {any} options
   * @return {Promise<void>}
   */
  async createTable(tableName, options = {}) {
    return this.#driver.createTable(tableName, options)
  }

  /**
   * Drop a table in database.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  async dropTable(tableName) {
    return this.#driver.dropTable(tableName)
  }

  /**
   * Remove all data inside some database table
   * and restart the identity of the table.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  async truncate(tableName) {
    return this.#driver.truncate(tableName)
  }

  /**
   * Make a raw query in database.
   *
   * @param {string} raw
   * @param {any[]} [queryValues]
   * @return {Promise<any>}
   */
  async raw(raw, queryValues) {
    return this.#driver.raw(raw, queryValues)
  }

  /**
   * Calculate the average of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async avg(column) {
    return this.#driver.avg(column)
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async avgDistinct(column) {
    return this.#driver.avgDistinct(column)
  }

  /**
   * Get the max number of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async max(column) {
    return this.#driver.max(column)
  }

  /**
   * Get the min number of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async min(column) {
    return this.#driver.min(column)
  }

  /**
   * Sum all numbers of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async sum(column) {
    return this.#driver.sum(column)
  }

  /**
   * Sum all numbers of a given column in distinct mode.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async sumDistinct(column) {
    return this.#driver.sumDistinct(column)
  }

  /**
   * Increment a value of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async increment(column) {
    return this.#driver.increment(column)
  }

  /**
   * Decrement a value of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async decrement(column) {
    return this.#driver.decrement(column)
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async count(column = '*') {
    return this.#driver.count(column)
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async countDistinct(column = '*') {
    return this.#driver.countDistinct(column)
  }

  /**
   * Find a value in database.
   *
   * @return {Promise<any>}
   */
  async find() {
    return this.#driver.find()
  }

  /**
   * Find many values in database.
   *
   * @return {Promise<any>}
   */
  async findMany() {
    return this.#driver.findMany()
  }

  /**
   * Find many values in database and return as paginated response.
   *
   * @param [page] {boolean}
   * @param [limit] {boolean}
   * @param [resourceUrl] {string}
   * @return {Promise<import('@secjs/utils').PaginatedResponse>}
   */
  async paginate(page = 0, limit = 10, resourceUrl = '/') {
    return this.#driver.paginate(page, limit, resourceUrl)
  }

  /**
   * Create a value in database.
   *
   * @param {any} data
   * @return {Promise<any>}
   */
  async create(data) {
    return this.#driver.create(data)
  }

  /**
   * Create many values in database.
   *
   * @param {any[]} data
   * @return {Promise<any[]>}
   */
  async createMany(data) {
    return this.#driver.createMany(data)
  }

  /**
   * Update a value in database.
   *
   * @param {any} data
   * @return {Promise<any>}
   */
  async update(data) {
    return this.#driver.update(data)
  }

  /**
   * Delete one value in database.
   *
   * @return {Promise<void>}
   */
  async delete(soft = false) {
    return this.#driver.delete(soft)
  }

  /**
   * Set the table that this query will be executed.
   *
   * @param tableName {string|any}
   * @return {Transaction}
   */
  buildTable(tableName) {
    this.#driver.buildTable(tableName)

    return this
  }

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {Transaction}
   */
  buildSelect(...columns) {
    this.#driver.buildSelect(columns)

    return this
  }

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {Transaction}
   */
  buildAddSelect(...columns) {
    this.#driver.buildAddSelect(...columns)

    return this
  }

  /**
   * Set a include statement in your query.
   *
   * @param relation {string|any}
   * @param [operation] {string}
   * @return {Transaction}
   */
  buildIncludes(relation, operation) {
    this.#driver.buildIncludes(relation, operation)

    return this
  }

  /**
   * Set a where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Transaction}
   */
  buildWhere(statement, value) {
    this.#driver.buildWhere(statement, value)

    return this
  }

  /**
   * Set a where like statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Transaction}
   */
  buildWhereLike(statement, value) {
    this.#driver.buildWhereLike(statement, value)

    return this
  }

  /**
   * Set a where ILike statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Transaction}
   */
  buildWhereILike(statement, value) {
    this.#driver.buildWhereILike(statement, value)

    return this
  }

  /**
   * Set a where not statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Transaction}
   */
  buildWhereNot(statement, value) {
    this.#driver.buildWhereNot(statement, value)

    return this
  }

  /**
   * Set a where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {Transaction}
   */
  buildWhereIn(columnName, values) {
    this.#driver.buildWhereIn(columnName, values)

    return this
  }

  /**
   * Set a where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {Transaction}
   */
  buildWhereNotIn(columnName, values) {
    this.#driver.buildWhereNotIn(columnName, values)

    return this
  }

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {Transaction}
   */
  buildWhereNull(columnName) {
    this.#driver.buildWhereNull(columnName)

    return this
  }

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {Transaction}
   */
  buildWhereNotNull(columnName) {
    this.#driver.buildWhereNotNull(columnName)

    return this
  }

  /**
   * Set a where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {Transaction}
   */
  buildWhereBetween(columnName, values) {
    this.#driver.buildWhereBetween(columnName, values)

    return this
  }

  /**
   * Set a where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {Transaction}
   */
  buildWhereNotBetween(columnName, values) {
    this.#driver.buildWhereNotBetween(columnName, values)

    return this
  }

  /**
   * Set a order by statement in your query.
   *
   * @param columnName {string}
   * @param [direction] {'asc'|'desc'|'ASC'|'DESC'}
   * @return {Transaction}
   */
  buildOrderBy(columnName, direction = 'ASC') {
    this.#driver.buildOrderBy(columnName, direction)

    return this
  }

  /**
   * Set the skip number in your query.
   *
   * @param number {number}
   * @return {Transaction}
   */
  buildSkip(number) {
    this.#driver.buildSkip(number)

    return this
  }

  /**
   * Set the limit number in your query.
   *
   * @param number {number}
   * @return {Transaction}
   */
  buildLimit(number) {
    this.#driver.buildLimit(number)

    return this
  }
}
