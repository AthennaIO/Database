/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { debug } from '#src/debug'
import { Config } from '@athenna/config'
import { Options } from '@athenna/common'
import type { Driver } from '#src/drivers/Driver'
import type { DriverKey } from '#src/types/DriverKey'
import { MongoDriver } from '#src/drivers/MongoDriver'
import { MySqlDriver } from '#src/drivers/MySqlDriver'
import { SqliteDriver } from '#src/drivers/SqliteDriver'
import { PostgresDriver } from '#src/drivers/PostgresDriver'
import { NotFoundDriverException } from '#src/exceptions/NotFoundDriverException'
import { NotImplementedConfigException } from '#src/exceptions/NotImplementedConfigException'

export class DriverFactory {
  /**
   * All athenna drivers connection configuration.
   */
  public static drivers: Map<string, DriverKey> = new Map()
    .set('mongo', {
      Driver: MongoDriver,
      client: null
    })
    .set('mysql', {
      Driver: MySqlDriver,
      client: null
    })
    .set('sqlite', {
      Driver: SqliteDriver,
      client: null
    })
    .set('postgres', {
      Driver: PostgresDriver,
      client: null
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
      debug('client found for driver %s, using it as default', driver)
      const impl = new Driver(con, client)

      impl.isSavedOnFactory = true

      return impl
    }

    this.drivers.set(driver, {
      Driver,
      client
    })

    return new Driver(con)
  }

  /**
   * Verify if client is present on driver.
   */
  public static hasClient(driver: string): boolean {
    return !!this.drivers.get(driver).client
  }

  /**
   * Get client of driver.
   */
  public static getClient(driver: string): any {
    return this.drivers.get(driver).client
  }

  /**
   * Set client on driver.
   */
  public static setClient(driver: string, client: any): void {
    const driverKey = this.drivers.get(driver)

    driverKey.client = client

    this.drivers.set(driver, driverKey)
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
