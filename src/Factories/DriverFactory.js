/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@secjs/utils'
import { Logger } from '@athenna/logger'

import { MySqlDriver } from '#src/Drivers/MySqlDriver'
import { PostgresDriver } from '#src/Drivers/PostgresDriver'

import { ConnectionFactory } from '#src/Factories/ConnectionFactory'
import { DriverExistException } from '#src/Exceptions/DriverExistException'
import { NotFoundDriverException } from '#src/Exceptions/NotFoundDriverException'
import { NotImplementedConfigException } from '#src/Exceptions/NotImplementedConfigException'
import { ConnectionFailedException } from '#src/Exceptions/ConnectionFailedException'
import { CloseConnectionFailedException } from '#src/Exceptions/CloseConnectionFailedException'

export class DriverFactory {
  /**
   * All athenna drivers connection configuration.
   *
   * @type {Map<string, { Driver: any, clientConnection?: any }>}
   */
  static #drivers = new Map()
    // .set('mongo', { Driver: MongoDriver })
    .set('mysql', { Driver: MySqlDriver })
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
   * @param {string} connectionName
   * @return {{ Driver: any, clientConnection?: any }}
   */
  static fabricate(connectionName) {
    const conConfig = this.#getConnectionConfig(connectionName)

    const { Driver, clientConnection } = this.#drivers.get(conConfig.driver)

    if (clientConnection) {
      return new Driver(connectionName, clientConnection)
    }

    this.#drivers.set(conConfig.driver, {
      Driver,
      clientConnection,
    })

    return new Driver(connectionName)
  }

  /**
   * Create a new driver implementation.
   *
   * @param {string} name
   * @param {any} driver
   */
  static createDriver(name, driver) {
    if (this.#drivers.has(name)) {
      throw new DriverExistException(name)
    }

    this.#drivers.set(name, { Driver: driver })
  }

  /**
   * Create the connection with database by driver name.
   *
   * @param {string} driverName
   * @param {string} [conName]
   * @param {boolean} [saveOnDriver]
   * @return {Promise<any>}
   */
  static async createConnectionByDriver(
    driverName,
    conName,
    saveOnDriver = true,
  ) {
    const driverObject = this.#getDriver(driverName)

    if (conName === 'default') {
      conName = Config.get('database.default')
    }

    let client = null

    try {
      client = await ConnectionFactory[driverName](conName)

      this.getLogger().success(
        `Successfully connected to ${conName} database connection`,
      )

      const dataSource = client
      const runner = client.createQueryRunner()

      if (!saveOnDriver) {
        return { runner, dataSource }
      }

      driverObject.clientConnection = { runner, dataSource }

      this.#drivers.set(driverName, driverObject)

      return { runner, dataSource }
    } catch (error) {
      throw new ConnectionFailedException(conName, driverName, error)
    }
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

    if (!client || !client.dataSource.isInitialized) {
      return
    }

    try {
      await client.runner.release()
      await client.dataSource.destroy()

      driverObject.clientConnection = null

      this.#drivers.set(driverName, driverObject)
    } catch (error) {
      throw new CloseConnectionFailedException(driverName, error)
    }
  }

  /**
   * Create the connection with database by connection name.
   *
   * @param {string} [conName]
   * @param {boolean} [saveOnDriver]
   * @return {Promise<any>}
   */
  static async createConnectionByName(conName, saveOnDriver = true) {
    const conConfig = this.#getConnectionConfig(conName)

    return this.createConnectionByDriver(
      conConfig.driver,
      conName,
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
   * @return {{ Driver: any, clientConnection?: any }}
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
   * @param {string} [connectionName]
   * @return {any}
   */
  static #getConnectionConfig(connectionName = 'default') {
    if (connectionName === 'default') {
      connectionName = Config.get('database.default')
    }

    const conConfig = Config.get(`database.connections.${connectionName}`)

    if (!conConfig) {
      throw new NotImplementedConfigException(connectionName)
    }

    if (!this.#drivers.has(conConfig.driver)) {
      throw new NotFoundDriverException(conConfig.driver)
    }

    return conConfig
  }

  /**
   * Mocking the Logger when client doesn't want to show it.
   *
   * @return {Logger}
   */
  static getLogger() {
    return process.env.NODE_ENV === 'test' || process.env.BOOT_LOGS === 'false'
      ? {
          channel: (_channel, _runtimeConfig) => {},
          log: (_message, _options = {}) => {},
          info: (_message, _options = {}) => {},
          warn: (_message, _options = {}) => {},
          error: (_message, _options = {}) => {},
          debug: (_message, _options = {}) => {},
          success: (_message, _options = {}) => {},
        }
      : new Logger().channel('console')
  }
}
