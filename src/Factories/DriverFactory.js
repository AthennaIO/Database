/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Logger } from '@athenna/logger'
import { Config } from '@athenna/config'

import { MySqlDriver } from '#src/Drivers/MySqlDriver'
import { PostgresDriver } from '#src/Drivers/PostgresDriver'

import { CloseConnectionFailedException } from '#src/Exceptions/CloseConnectionFailedException'
import { ConnectionFailedException } from '#src/Exceptions/ConnectionFailedException'
import { DriverExistException } from '#src/Exceptions/DriverExistException'
import { NotFoundDriverException } from '#src/Exceptions/NotFoundDriverException'
import { NotImplementedConfigException } from '#src/Exceptions/NotImplementedConfigException'
import { ConnectionFactory } from '#src/Factories/ConnectionFactory'

export class DriverFactory {
  /**
   * All athenna drivers connection configuration.
   *
   * @type {Map<string, { Driver: any, client?: any }>}
   */
  static #drivers = new Map()
    .set('mysql', { Driver: MySqlDriver })
    .set('postgres', { Driver: PostgresDriver })

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
        if (!value.client) continue

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
   * @return {{ Driver: any, client?: any }}
   */
  static fabricate(connectionName) {
    const conConfig = this.#getConnectionConfig(connectionName)

    const { Driver, client } = this.#drivers.get(conConfig.driver)

    if (connectionName === 'default') {
      connectionName = Config.get('database.default')
    }

    if (client) {
      return new Driver(connectionName, client)
    }

    this.#drivers.set(conConfig.driver, {
      Driver,
      client,
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

    try {
      const client = await ConnectionFactory[driverName](conName)

      this.getLogger().success(
        `Successfully connected to ${conName} database connection`,
      )

      if (!saveOnDriver) {
        return client
      }

      driverObject.client = client

      this.#drivers.set(driverName, driverObject)

      return client
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

    const client = driverObject.client

    if (!client) {
      return
    }

    try {
      await client.destroy()

      driverObject.client = null

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
   * @return {{ Driver: any, client?: any }}
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
    const logger = new Logger()

    return process.env.NODE_ENV === 'test' || process.env.BOOT_LOGS === 'false'
      ? logger.channel('discard')
      : logger.channel('application')
  }
}
