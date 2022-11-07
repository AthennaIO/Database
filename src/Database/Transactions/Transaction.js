import { QueryBuilder } from '#src/Database/Builders/QueryBuilder'

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
   * @return {import('knex').Knex|null}
   */
  getClient() {
    return this.#driver.getClient()
  }

  /**
   * Return the query builder of driver.
   *
   * @return {import('knex').Knex.QueryBuilder|null}
   */
  getQueryBuilder() {
    return this.#driver.getQueryBuilder()
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
  table(tableName) {
    return new QueryBuilder(this.#driver, tableName)
  }
}
