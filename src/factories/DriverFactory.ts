/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Log } from '@athenna/logger'
import { Config } from '@athenna/config'
import { Exec, Options } from '@athenna/common'
import type { Driver } from '#src/drivers/Driver'
import type { DriverKey } from '#src/types/DriverKey'
import { PostgresDriver } from '#src/drivers/PostgresDriver'
import type { CreateConOptions } from '#src/types/CreateConOptions'
import { ConnectionFactory } from '#src/factories/ConnectionFactory'
import { NotFoundDriverException } from '#src/exceptions/NotFoundDriverException'
import { ConnectionFailedException } from '#src/exceptions/ConnectionFailedException'
import { NotImplementedConfigException } from '#src/exceptions/NotImplementedConfigException'

export class DriverFactory {
  /**
   * All athenna drivers connection configuration.
   */
  public static drivers: Map<string, DriverKey> = new Map().set('postgres', {
    Driver: PostgresDriver
  })

  /**
   * Return all available drivers.
   */
  public static availableDrivers(options: { onlyConnected?: boolean } = {}) {
    options = Options.create(options, { onlyConnected: false })

    const availableDrivers = []

    for (const [key, value] of this.drivers.entries()) {
      if (options.onlyConnected) {
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
   */
  public static fabricate(con: string): Driver {
    con = this.parseConName(con)

    const { driver } = this.getConnectionConfig(con)
    const { Driver, client } = this.drivers.get(driver)

    if (client) {
      return new Driver(con, client)
    }

    this.drivers.set(driver, {
      Driver,
      client
    })

    return new Driver(con)
  }

  /**
   * Create the connection with database using
   * the configuration name to find the configs.
   */
  public static async createConnection(
    con: string,
    options?: CreateConOptions
  ): Promise<any> {
    con = this.parseConName(con)

    options = Options.create(options, {
      saveOnFactory: false
    })

    const { driver } = this.getConnectionConfig(con)
    const driverKey = this.drivers.get(driver)

    try {
      const client = await ConnectionFactory[driver](con)

      if (Config.is('rc.bootLogs', true)) {
        await Log.channelOrVanilla('application').success(
          `Successfully connected to ({yellow} ${con}) database connection`
        )
      }

      if (!options.saveOnFactory) {
        return client
      }

      driverKey.client = client

      this.drivers.set(driver, driverKey)

      return client
    } catch (error) {
      throw new ConnectionFailedException(con, driver, error)
    }
  }

  /**
   * Close the connection with database by con name.
   */
  public static async closeConnection(con: string): Promise<void> {
    con = this.parseConName(con)

    const { driver } = this.getConnectionConfig(con)
    const driverKey = this.drivers.get(driver)
    const client = driverKey.client

    if (!client) {
      return
    }

    await ConnectionFactory.closeByDriver(driver, client)

    driverKey.client = null

    this.drivers.set(driver, driverKey)
  }

  /**
   * Close all opened connections of DriverFactory.
   */
  public static async closeAllConnections(): Promise<void> {
    const availableDrivers = this.availableDrivers({ onlyConnected: true })

    await Exec.concurrently(availableDrivers, async (driver: string) => {
      const driverKey = this.drivers.get(driver)

      await ConnectionFactory.closeByDriver(driver, driverKey.client)

      driverKey.client = null

      this.drivers.set(driver, driverKey)
    })
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
  private static getConnectionConfig(con: string): any {
    const conConfig = Config.get(`database.connections.${con}`)

    if (!conConfig) {
      throw new NotImplementedConfigException(con)
    }

    if (!this.drivers.has(conConfig.driver)) {
      throw new NotFoundDriverException(conConfig.driver)
    }

    return conConfig
  }
}
