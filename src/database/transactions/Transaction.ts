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
import { QueryBuilder } from '#src/database/builders/QueryBuilder'

export class Transaction<Client = any, QB = any> {
  /**
   * The drivers responsible for handling database operations.
   */
  public driver: Driver<Client, QB> = null

  /**
   * Creates a new instance of transaction.
   */
  public constructor(driver: Driver) {
    this.driver = driver
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
   * Commit the transaction.
   */
  public async commitTransaction(): Promise<void> {
    return this.driver.commitTransaction()
  }

  /**
   * Rollback the transaction.
   */
  public async rollbackTransaction(): Promise<void> {
    return this.driver.rollbackTransaction()
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
    return this.driver.createDatabase(database)
  }

  /**
   * Drop some database.
   */
  public async dropDatabase(database: string): Promise<void> {
    return this.driver.dropDatabase(database)
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
    closure?: (builder: Knex.TableBuilder) => void | Promise<void>
  ): Promise<void> {
    return this.driver.createTable(table, closure)
  }

  /**
   * Drop a table in database.
   */
  public async dropTable(table: string): Promise<void> {
    return this.driver.dropTable(table)
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
  public table(table: string | any): QueryBuilder {
    return new QueryBuilder(this.driver, table)
  }
}
