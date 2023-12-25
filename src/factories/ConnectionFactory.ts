/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Knex } from 'knex'
import { debug } from '#src/debug'
import { Log } from '@athenna/logger'
import { Config } from '@athenna/config'
import type { Connection } from 'mongoose'
import { Exec, Json, Module } from '@athenna/common'
import { DriverFactory } from '#src/factories/DriverFactory'

export class ConnectionFactory {
  /**
   * Close the connection by the driver that is being used.
   */
  public static async closeByDriver(
    driver: string,
    client: any
  ): Promise<void> {
    switch (driver) {
      case 'fake':
      case 'mysql':
      case 'sqlite':
      case 'postgres':
        await client.destroy()
        break
      case 'mongo':
        await client.close()
        break
    }
  }

  /**
   * Close all opened connections of DriverFactory.
   */
  public static async closeAllConnections(): Promise<void> {
    const availableDrivers = DriverFactory.availableDrivers({
      onlyConnected: true
    })

    await Exec.concurrently(availableDrivers, async (driver: string) => {
      debug('closing connection for %s driver', driver)

      await this.closeByDriver(driver, DriverFactory.getClient(driver))

      DriverFactory.setClient(driver, null)
    })
  }

  /**
   * Log that connection was created.
   */
  public static log(con: string): void {
    if (Config.is('rc.bootLogs', true)) {
      Log.channelOrVanilla('application').success(
        `Successfully connected to ({yellow} ${con}) database connection`
      )
    }
  }

  /**
   * For testing purposes only.
   */
  public static fake() {}

  /**
   * Create the connection with a mysql database.
   */
  public static mysql(con: string): Knex {
    const client = this.knex(con, 'mysql2')

    this.log(con)

    return client
  }

  /**
   * Create the connection with a mongo database.
   */
  public static mongo(con: string): Connection {
    const client = this.mongoose(con)

    this.log(con)

    return client
  }

  /**
   * Create the connection with a sqlite database.
   */
  public static sqlite(con: string): Knex {
    const client = this.knex(con, 'better-sqlite3')

    this.log(con)

    return client
  }

  /**
   * Create the connection with a postgres database.
   */
  public static postgres(con: string): Knex {
    const client = this.knex(con, 'pg')

    this.log(con)

    return client
  }

  /**
   * Create a database connection using mongoose.
   */
  public static mongoose(con: string) {
    const mongoose = this.getMongoose()
    const configs = Config.get(`database.connections.${con}`, {})
    const options = Json.omit(configs, ['url', 'driver', 'sync'])

    debug('creating new connection using Mongoose. Options defined: %o', {
      url: configs.url,
      ...options
    })

    return mongoose.createConnection(configs.url, options)
  }

  /**
   * Create a database connection using knex.
   */
  public static knex(con: string, client: string): Knex {
    const knex = this.getKnex()
    const configs = Config.get(`database.connections.${con}`, {})
    const options = {
      client,
      migrations: {
        tableName: 'migrations'
      },
      pool: {
        min: 2,
        max: 20,
        acquireTimeoutMillis: 60 * 1000
      },
      debug: false,
      useNullAsDefault: false,
      ...Json.omit(configs, ['driver', 'sync'])
    }

    debug('creating new connection using Knex. Options defined: %o', options)

    return knex.default(options)
  }

  /**
   * Import knex in a method to be easier to mock.
   */
  public static getKnex() {
    const require = Module.createRequire(import.meta.url)

    return require('knex')
  }

  /**
   * Import mongoose in a method to be easier to mock.
   */
  public static getMongoose() {
    const require = Module.createRequire(import.meta.url)

    let mongoose = require('mongoose')

    if (!mongoose.createConnection) {
      mongoose = mongoose.default
    }

    return mongoose
  }
}
