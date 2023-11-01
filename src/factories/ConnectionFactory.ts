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
import { Config } from '@athenna/config'
import type { Connection } from 'mongoose'
import { Json, Module } from '@athenna/common'

export class ConnectionFactory {
  /**
   * Close the connection by the driver that is being used.
   */
  public static async closeByDriver(
    driver: string,
    client: any
  ): Promise<void> {
    switch (driver) {
      case 'mysql':
      case 'postgres':
        await client.destroy()
        break
      case 'mongo':
        await client.close()
        break
    }
  }

  /**
   * Create the connection with a mysql database.
   */
  public static mysql(con: string): Knex {
    return this.knex(con, 'mysql2')
  }

  /**
   * Create the connection with a mongo database.
   */
  public static mongo(con: string): Connection {
    return this.mongoose(con)
  }

  /**
   * Create the connection with a postgres database.
   */
  public static postgres(con: string): Knex {
    return this.knex(con, 'pg')
  }

  /**
   * Create a database connection using mongoose.
   */
  public static mongoose(con: string) {
    const mongoose = this.getMongoose()
    const configs = Config.get(`database.connections.${con}`, {})
    const options = Json.omit(configs, ['url', 'driver'])

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
      ...Json.omit(configs, ['driver'])
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
