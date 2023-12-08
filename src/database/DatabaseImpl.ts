/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Knex } from 'knex'
import type { MongoDriver } from '#src/drivers/MongoDriver'
import type { MySqlDriver } from '#src/drivers/MySqlDriver'
import { DriverFactory } from '#src/factories/DriverFactory'
import type { SqliteDriver } from '#src/drivers/SqliteDriver'
import type { Driver as DriverImpl } from '#src/drivers/Driver'
import type { Connections, ConnectionOptions } from '#src/types'
import type { PostgresDriver } from '#src/drivers/PostgresDriver'
import { QueryBuilder } from '#src/database/builders/QueryBuilder'
import { ConnectionFactory } from '#src/factories/ConnectionFactory'
import type { Transaction } from '#src/database/transactions/Transaction'

export class DatabaseImpl<Driver extends DriverImpl = any> {
  /**
   * The connection name used for this instance.
   */
  public connectionName = Config.get<Connections>('database.default')

  /**
   * The drivers responsible for handling database operations.
   */
  public driver: Driver = null

  /**
   * Creates a new instance of DatabaseImpl.
   */
  public constructor(athennaDbOpts?: ConnectionOptions) {
    this.driver = DriverFactory.fabricate(
      this.connectionName
    ) as unknown as Driver

    this.connect(athennaDbOpts)
  }

  public connection(
    con: 'mongo',
    options?: ConnectionOptions
  ): DatabaseImpl<MongoDriver>

  public connection(
    con: 'mysql',
    options?: ConnectionOptions
  ): DatabaseImpl<MySqlDriver>

  public connection(
    con: 'sqlite',
    options?: ConnectionOptions
  ): DatabaseImpl<SqliteDriver>

  public connection(
    con: 'postgres',
    options?: ConnectionOptions
  ): DatabaseImpl<PostgresDriver>

  public connection(
    con: Connections,
    options?: ConnectionOptions
  ):
    | DatabaseImpl<MongoDriver>
    | DatabaseImpl<MySqlDriver>
    | DatabaseImpl<SqliteDriver>
    | DatabaseImpl<PostgresDriver>

  /**
   * Change the database connection.
   */
  public connection(con: Connections, options?: ConnectionOptions) {
    const driver = DriverFactory.fabricate(con)
    const database = new DatabaseImpl<typeof driver>(options)

    database.connectionName = con
    database.driver = driver

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
  public connect(options?: ConnectionOptions): DatabaseImpl<Driver> {
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
  public getClient() {
    return this.driver.getClient()
  }

  /**
   * Return the query builder of driver.
   */
  public getQueryBuilder() {
    return this.driver.getQueryBuilder()
  }

  /**
   * Create a new transaction.
   */
  public async startTransaction(): Promise<Transaction<Driver>> {
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
  public table<T = any>(table: string | any): QueryBuilder<T, Driver> {
    return new QueryBuilder(this.driver, table)
  }
}
