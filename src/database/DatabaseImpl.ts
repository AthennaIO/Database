/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Knex } from 'knex'
import type { Driver } from '#src/drivers/Driver'
import type { Collection, Connection } from 'mongoose'
import { DriverFactory } from '#src/factories/DriverFactory'
import { QueryBuilder } from '#src/database/builders/QueryBuilder'
import { ConnectionFactory } from '#src/factories/ConnectionFactory'
import type { ConnectionOptions } from '#src/types/ConnectionOptions'
import type { Transaction } from '#src/database/transactions/Transaction'

export class DatabaseImpl<Client = any, QB = any> {
  /**
   * The connection name used for this instance.
   */
  public connectionName = Config.get('database.default')

  /**
   * The drivers responsible for handling database operations.
   */
  public driver: Driver<Client, QB> = null

  /**
   * Creates a new instance of DatabaseImpl.
   */
  public constructor(athennaDbOpts?: ConnectionOptions) {
    this.driver = DriverFactory.fabricate(this.connectionName)

    this.connect(athennaDbOpts)
  }

  public connection(
    connection: 'mongo',
    options?: ConnectionOptions
  ): DatabaseImpl<Connection, Collection>

  public connection(
    connection: 'mysql',
    options?: ConnectionOptions
  ): DatabaseImpl<Knex, Knex.QueryBuilder>

  public connection(
    connection: 'sqlite',
    options?: ConnectionOptions
  ): DatabaseImpl<Knex, Knex.QueryBuilder>

  public connection(
    connection: 'postgres',
    options?: ConnectionOptions
  ): DatabaseImpl<Knex, Knex.QueryBuilder>

  /**
   * Change the database connection.
   */
  public connection(
    connection: string,
    options?: ConnectionOptions
  ): DatabaseImpl {
    const database = new DatabaseImpl(options)

    database.connectionName = connection
    database.driver = DriverFactory.fabricate(connection)

    return database
  }

  /**
   * Verify if database is already connected.
   */
  public isConnected(): boolean {
    return this.driver.isConnected
  }

  /**
   * Connect to database.
   */
  public connect(options?: ConnectionOptions): DatabaseImpl<Client, QB> {
    this.driver.connect(options)

    return this
  }

  /**
   * Close the connection with database in this instance.
   */
  public async close(): Promise<void> {
    await this.driver.close()
  }

  /**
   * Close all the connections with all databases.
   */
  public async closeAll(): Promise<void> {
    await ConnectionFactory.closeAllConnections()
  }

  /**
   * Return the client of driver.
   */
  public getClient(): Client {
    return this.driver.getClient()
  }

  /**
   * Return the query builder of driver.
   */
  public getQueryBuilder(): QB {
    return this.driver.getQueryBuilder()
  }

  /**
   * Create a new transaction.
   */
  public async startTransaction(): Promise<Transaction<Client, QB>> {
    return this.driver.startTransaction()
  }

  /**
   * Run database migrations.
   */
  public async runMigrations(): Promise<void> {
    await this.driver.runMigrations()
  }

  /**
   * Revert database migrations.
   */
  public async revertMigrations(): Promise<void> {
    await this.driver.revertMigrations()
  }

  /**
   * List all databases available.
   */
  public async getDatabases(): Promise<string[]> {
    return this.driver.getDatabases()
  }

  /**
   * Get the current database name.
   */
  public async getCurrentDatabase(): Promise<string | undefined> {
    return this.driver.getCurrentDatabase()
  }

  /**
   * Verify if database exists.
   */
  public async hasDatabase(database: string): Promise<boolean> {
    return this.driver.hasDatabase(database)
  }

  /**
   * Create a new database.
   */
  public async createDatabase(database: string): Promise<void> {
    await this.driver.createDatabase(database)
  }

  /**
   * Drop some database.
   */
  public async dropDatabase(database: string): Promise<void> {
    await this.driver.dropDatabase(database)
  }

  /**
   * List all tables available.
   */
  public async getTables(): Promise<string[]> {
    return this.driver.getTables()
  }

  /**
   * Verify if table exists.
   */
  public async hasTable(table: string): Promise<boolean> {
    return this.driver.hasTable(table)
  }

  /**
   * Create a new table in database.
   */
  public async createTable(
    table: string,
    closure: (builder: Knex.TableBuilder) => void | Promise<void>
  ): Promise<void> {
    await this.driver.createTable(table, closure)
  }

  /**
   * Drop a table in database.
   */
  public async dropTable(table: string): Promise<void> {
    await this.driver.dropTable(table)
  }

  /**
   * Remove all data inside some database table
   * and restart the identity of the table.
   */
  public async truncate(table: string): Promise<void> {
    return this.driver.truncate(table)
  }

  /**
   * Make a raw query in database.
   */
  public raw<T = any>(sql: string, bindings?: any): Knex.Raw<T> {
    return this.driver.raw(sql, bindings)
  }

  /**
   * Creates a new instance of QueryBuilder for this table.
   */
  public table(table: string | any): QueryBuilder<Client, QB> {
    return new QueryBuilder<Client, QB>(this.driver, table)
  }
}
