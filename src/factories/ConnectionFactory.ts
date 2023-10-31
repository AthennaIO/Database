/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Knex } from 'knex'
import { Json } from '@athenna/common'
import { Config } from '@athenna/config'
import type { Connection } from 'mongoose'

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
  public static async mysql(con: string): Promise<Knex> {
    return this.knex(con, 'mysql2')
  }

  /**
   * Create the connection with a mongo database.
   */
  public static async mongo(con: string): Promise<Connection> {
    return this.mongoose(con)
  }

  /**
   * Create the connection with a postgres database.
   */
  public static async postgres(con: string): Promise<Knex> {
    return this.knex(con, 'pg')
  }

  /**
   * Create a database connection using mongoose.
   */
  public static async mongoose(con: string) {
    const mongoose = await this.getMongoose()
    const configs = Config.get(`database.connections.${con}`, {})

    return mongoose
      .createConnection(configs.url, Json.omit(configs, ['url']))
      .asPromise()
  }

  /**
   * Create a database connection using knex.
   */
  public static async knex(con: string, client: string): Promise<Knex> {
    const knex = await this.getKnex()
    const configs = Config.get(`database.connections.${con}`, {})

    return knex.default({
      client,
      connection: configs,
      migrations: configs.migrations || {
        tableName: 'migrations'
      },
      pool: configs.pool || {
        min: 2,
        max: 20,
        acquireTimeoutMillis: 60 * 1000
      },
      debug: configs.debug || false,
      useNullAsDefault: configs.useNullAsDefault || false
    })
  }

  /**
   * Import knex in a method to be easier to mock.
   */
  public static async getKnex() {
    return await import('knex')
  }

  /**
   * Import mongoose in a method to be easier to mock.
   */
  public static async getMongoose() {
    let mongoose = await import('mongoose')

    if (!mongoose.createConnection) {
      mongoose = mongoose.default
    }

    return mongoose
  }
}
