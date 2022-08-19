/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@secjs/utils'

import { PostgresDriver } from '#src/Drivers/PostgresDriver'
import { ConnectionFactory } from '#src/Factories/ConnectionFactory'
import { DriverExistException } from '#src/Exceptions/DriverExistException'
import { NotFoundDriverException } from '#src/Exceptions/NotFoundDriverException'
import { NotImplementedConfigException } from '#src/Exceptions/NotImplementedConfigException'

export class DriverFactory {
  /**
   * All athenna drivers connection configuration.
   *
   * @type {Map<string, { Driver: any, lastConName?: string, clientConnection?: any }>}
   */
  static #drivers = new Map()
    // .set('mongo', { Driver: MongoDriver })
    // .set('mysql', { Driver: MySqlDriver })
    // .set('sqlite', { Driver: SqliteDriver })
    .set('postgres', { Driver: PostgresDriver })
  // .set('sqlserver', { Driver: SqlServerDriver })

  /**
   * Return all available drivers.
   *
   * @param {boolean} onlyConnected
   * @return {string[]}
   */
  static availableDrivers(onlyConnected = false) {
    const availableDrivers = []

    for (const [key, value] of this.#drivers.entries()) {
      if (onlyConnected) {
        if (!value.clientConnection) continue

        availableDrivers.push(key)

        continue
      }

      availableDrivers.push(key)
    }

    return availableDrivers
  }

  /**
   * Fabricate a new connection with some database driver.
   *
   * @param {string} conName
   * @param {any} runtimeConfig
   * @return {{ Driver: any, lastConName?: string, clientConnection?: any }}
   */
  static fabricate(conName, runtimeConfig = {}) {
    const conConfig = this.#getConnectionConfig(conName)

    const { Driver, clientConnection } = this.#drivers.get(conConfig.driver)

    if (clientConnection) {
      return new Driver(clientConnection, runtimeConfig)
    }

    this.#drivers.set(conConfig.driver, {
      Driver,
      clientConnection,
      lastConName: conName,
    })

    return new Driver(conName, runtimeConfig)
  }

  /**
   * Create a new driver implementation.
   *
   * @param {string} name
   * @param {new (connection: string, configs?: any) => { Driver: any, lastConName?: string, clientConnection?: any }} driver
   */
  static createDriver(name, driver) {
    if (this.#drivers.has(name)) {
      throw new DriverExistException(name)
    }

    this.#drivers.set(name, { Driver: driver })
  }

  /**
   * Create the connection with all drivers.
   *
   * @return {Promise<void>}
   */
  static async createAllDriversConnection() {
    for (const [key] of this.#drivers.keys()) {
      await this.createConnectionByDriver(key)
    }
  }

  /**
   * Close the connection with all drivers.
   *
   * @return {Promise<void>}
   */
  static async closeAllDriversConnection() {
    for (const [key] of this.#drivers.keys()) {
      await this.closeConnectionByDriver(key)
    }
  }

  /**
   * Set the client connection for driver.
   *
   * @param {string} driverName
   * @param {any} clientConnection
   */
  static setClientConnection(driverName, clientConnection) {
    const driverObject = this.#getDriver(driverName)

    driverObject.clientConnection = clientConnection

    this.#drivers.set(driverName, driverObject)
  }

  /**
   * Create the connection with database by driver name.
   *
   * @param {string} driverName
   * @param {string} [conName]
   * @param {any} [configs]
   * @param {boolean} [saveOnDriver]
   * @return {Promise<any>}
   */
  static async createConnectionByDriver(
    driverName,
    conName,
    configs = {},
    saveOnDriver = true,
  ) {
    const driverObject = this.#getDriver(driverName)

    if (!conName) {
      conName = driverObject.lastConName
    }

    const client = await ConnectionFactory[driverName](conName, configs)

    if (!saveOnDriver) {
      return client
    }

    driverObject.clientConnection = client
    this.#drivers.set(driverName, driverObject)

    return client
  }

  /**
   * Close the connection with database by driver name.
   *
   * @param {string} driverName
   * @return {Promise<void>}
   */
  static async closeConnectionByDriver(driverName) {
    const driverObject = this.#getDriver(driverName)

    const client = driverObject.clientConnection

    if (client.close) {
      await client.close()
    } else {
      await client.destroy()
    }

    driverObject.clientConnection = null

    this.#drivers.set(driverName, driverObject)
  }

  /**
   * Create the connection with database by connection name.
   *
   * @param {string} [conName]
   * @param {any} [configs]
   * @param {boolean} [saveOnDriver]
   * @return {Promise<any>}
   */
  static async createConnectionByName(
    conName,
    configs = {},
    saveOnDriver = true,
  ) {
    const conConfig = this.#getConnectionConfig(conName)

    return this.createConnectionByDriver(
      conConfig.driver,
      conName,
      configs,
      saveOnDriver,
    )
  }

  /**
   * Close the connection with database by connection name.
   *
   * @param {string} [conName]
   * @return {Promise<void>}
   */
  static async closeConnectionByName(conName) {
    const conConfig = this.#getConnectionConfig(conName)

    await this.closeConnectionByDriver(conConfig.driver)
  }

  /**
   * Safe get the driver verifying if it exists.
   *
   * @param {string} driverName
   * @return {{ Driver: any, lastConName?: string, clientConnection?: any }}
   */
  static #getDriver(driverName) {
    if (!this.#drivers.has(driverName)) {
      throw new NotFoundDriverException(driverName)
    }

    return this.#drivers.get(driverName)
  }

  /**
   * Get the connection configuration of config/database file.
   *
   * @param {string} [conName]
   * @return {any}
   */
  static #getConnectionConfig(conName = 'default') {
    if (conName === 'default') {
      conName = Config.get('database.default')
    }

    const conConfig = Config.get(`database.connections.${conName}`)

    if (!conConfig) {
      throw new NotImplementedConfigException(conName)
    }

    if (!this.#drivers.has(conConfig.driver)) {
      throw new NotFoundDriverException(conConfig.driver)
    }

    return conConfig
  }
}
