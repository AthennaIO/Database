/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { QueryBuilder } from '#src/Builders/QueryBuilder'
import { DriverFactory } from '#src/Factories/DriverFactory'

export * from './Builders/Column.js'
export * from './Builders/Criteria.js'
export * from './Builders/Relation.js'
export * from './Builders/Schema.js'
export * from './Facades/Database.js'
export * from './Factories/ConnectionFactory.js'
export * from './Factories/DriverFactory.js'
export * from './Factories/ModelFactory.js'
export * from './Generators/ModelGenerator.js'
export * from './Helpers/DatabaseLoader.js'
export * from './Migrations/Migration.js'
export * from './Models/Model.js'
export * from './Resources/Resource.js'
export * from './Seeders/Seeder.js'

export class DatabaseImpl {
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
   * Creates a new instance of DatabaseImpl.
   *
   * @return {DatabaseImpl}
   */
  constructor() {
    this.#driver = DriverFactory.fabricate(this.#connection)
  }

  /**
   * Change the database connection.
   *
   * @param {string} connection
   * @return {DatabaseImpl}
   */
  connection(connection) {
    this.#driver = DriverFactory.fabricate(connection)

    return this
  }

  /**
   * Connect to database.
   *
   * @param {boolean} force
   * @param {boolean} saveOnFactory
   * @return {Promise<this>}
   */
  async connect(force = false, saveOnFactory = true) {
    await this.#driver.connect(force, saveOnFactory)

    return this
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
   * Return the client of driver.
   *
   * @return {import('knex').Knex|null}
   */
  getClient() {
    return this.#driver.getClient()
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
   * Run database migrations.
   *
   * @return {Promise<void>}
   */
  async runMigrations() {
    await this.#driver.runMigrations()
  }

  /**
   * Revert database migrations.
   *
   * @return {Promise<void>}
   */
  async revertMigrations() {
    await this.#driver.revertMigrations()
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
   * @param {(builder: import('knex').Knex.TableBuilder) => void|Promise<void>} callback
   * @return {Promise<void>}
   */
  async createTable(tableName, callback) {
    return this.#driver.createTable(tableName, callback)
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
   * Creates a new instance of QueryBuilder for this table.
   *
   * @param tableName {string|any}
   * @return {QueryBuilder}
   */
  buildTable(tableName) {
    return new QueryBuilder(this.#driver, tableName)
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
   * @return {Transaction}
   */
  constructor(driver) {
    this.#driver = driver
  }

  /**
   * Return the client of driver.
   *
   * @return {import('typeorm').DataSource|null}
   */
  getClient() {
    return this.#driver.getClient()
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
   * Run database migrations.
   *
   * @return {Promise<void>}
   */
  async runMigrations() {
    await this.#driver.runMigrations()
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
   * @param {import('typeorm').TableOptions} options
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
   * Creates a new instance of QueryBuilder for this table.
   *
   * @param tableName {string|any}
   * @return {QueryBuilder}
   */
  buildTable(tableName) {
    return new QueryBuilder(this.#driver, tableName)
  }
}
