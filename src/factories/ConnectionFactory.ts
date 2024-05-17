/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { debug } from '#src/debug'
import type { Driver } from '#src/database/drivers/Driver'
import { FakeDriver } from '#src/database/drivers/FakeDriver'
import { MongoDriver } from '#src/database/drivers/MongoDriver'
import { MySqlDriver } from '#src/database/drivers/MySqlDriver'
import { SqliteDriver } from '#src/database/drivers/SqliteDriver'
import { PostgresDriver } from '#src/database/drivers/PostgresDriver'
import { NotFoundDriverException } from '#src/exceptions/NotFoundDriverException'
import { NotImplementedConfigException } from '#src/exceptions/NotImplementedConfigException'

export class ConnectionFactory {
  /**
   * Holds all the open connections.
   */
  public static connections: Map<string, any> = new Map()

  /**
   * Holds all the Athenna drivers implementations available.
   */
  public static drivers: Map<string, any> = new Map()
    .set('fake', { driver: FakeDriver })
    .set('mongo', { driver: MongoDriver })
    .set('mysql', { driver: MySqlDriver })
    .set('sqlite', { driver: SqliteDriver })
    .set('postgres', { driver: PostgresDriver })

  public static fabricate(con: 'fake'): typeof FakeDriver
  public static fabricate(con: 'mongo'): MongoDriver
  public static fabricate(con: 'mysql'): MySqlDriver
  public static fabricate(con: 'sqlite'): SqliteDriver
  public static fabricate(con: 'postgres'): PostgresDriver
  public static fabricate(
    con: 'fake' | 'mongo' | 'mysql' | 'sqlite' | 'postgres' | string
  ):
    | typeof FakeDriver
    | MongoDriver
    | MySqlDriver
    | SqliteDriver
    | PostgresDriver

  /**
   * Fabricate a new connection for a specific driver.
   */
  public static fabricate(con: string) {
    con = this.parseConName(con)

    const driverName = this.getConnectionDriver(con)
    const Driver = this.drivers.get(driverName).driver
    const connection = this.connections.get(con)

    if (!connection) {
      this.connections.set(con, { client: null })

      return new Driver(con)
    }

    if (connection.client) {
      debug(
        'client found for connection %s using driver %s, using it as default',
        con,
        driverName
      )

      return new Driver(con, connection.client)
    }

    return new Driver(con)
  }

  /**
   * Verify if client is present on a driver connection.
   */
  public static hasClient(con: string): boolean {
    return !!this.connections.get(con)?.client
  }

  /**
   * Get client of a connection.
   */
  public static getClient(con: string): any {
    return this.connections.get(con)?.client
  }

  /**
   * Set connection client on driver.
   */
  public static setClient(con: string, client: any): void {
    const connection = this.connections.get(con) || {}

    connection.client = client

    this.connections.set(con, connection)
  }

  /**
   * Return all available drivers.
   */
  public static availableDrivers() {
    const availableDrivers = []

    for (const key of this.drivers.keys()) {
      availableDrivers.push(key)
    }

    return availableDrivers
  }

  /**
   * Return all available connections.
   */
  public static availableConnections() {
    const availableConnections = []

    for (const key of this.connections.keys()) {
      availableConnections.push(key)
    }

    return availableConnections
  }

  /**
   * Define your own database driver implementation to use
   * within Database facade.
   *
   * @example
   * ```ts
   * import { Driver, ConnectionFactory } from '@athenna/database'
   *
   * class TestDriver extends Driver {}
   *
   * ConnectionFactory.createDriver('test', TestDriver)
   * ```
   */
  public static createDriver(name: string, impl: typeof Driver<any, any>) {
    this.drivers.set(name, { driver: impl })
  }

  /**
   * Parse connection config name if is default
   */
  private static parseConName(con: string): string {
    if (con === 'default') {
      return Config.get('database.default')
    }

    return con
  }

  /**
   * Get the connection configuration of config/database file.
   */
  private static getConnectionDriver(con: string): string {
    const config = Config.get(`database.connections.${con}`)

    if (!config) {
      throw new NotImplementedConfigException(con)
    }

    if (!this.drivers.has(config.driver)) {
      throw new NotFoundDriverException(config.driver)
    }

    return config.driver
  }
}
