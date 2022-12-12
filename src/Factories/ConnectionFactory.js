/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import knex from 'knex'
import mongoose from 'mongoose'

import { Config } from '@athenna/config'
import { Json, Parser } from '@athenna/common'

export class ConnectionFactory {
  /**
   * Create the connection with a mysql database.
   *
   * @param {string} conName
   * @return {Promise<any>}
   */
  static async mysql(conName) {
    return this.#knex(conName, 'mysql2')
  }

  /**
   * Create the connection with a mongo database.
   *
   * @param {string} conName
   * @return {Promise<any>}
   */
  static async mongo(conName) {
    return this.#mongoose(conName)
  }

  /**
   * Create the connection with a postgres database.
   *
   * @param {string} conName
   * @return {Promise<any>}
   */
  static async postgres(conName) {
    return this.#knex(conName, 'pg')
  }

  /**
   * Create a database connection using mongoose.
   *
   * @param {string} conName
   * @return {Promise<import('mongoose').Mongoose.Connection>}
   */
  static async #mongoose(conName) {
    const configs = Config.get(`database.connections.${conName}`)

    const connectionUrl = Parser.connectionObjToDbUrl(configs)

    return mongoose.createConnection(connectionUrl)
  }

  /**
   * Create a database connection using knex.
   *
   * @param {string} conName
   * @param {string} client
   * @return {Promise<import('typeorm').DataSource>}
   */
  static async #knex(conName, client) {
    const configs = Json.copy(Config.get(`database.connections.${conName}`))

    const poolConfig = Json.copy(configs.pool)
    const debugConfig = Json.copy(configs.debug)
    const useNullAsDefaultConfig = Json.copy(configs.useNullAsDefault)

    delete configs.pool
    delete configs.driver
    delete configs.debug
    delete configs.synchronize
    delete configs.useNullAsDefault

    return knex({
      client,
      connection: configs,
      migrations: {
        tableName: Config.get('database.migrations'),
      },
      pool: poolConfig || {
        min: 2,
        max: 20,
        acquireTimeoutMillis: 60 * 1000,
      },
      debug: debugConfig || false,
      useNullAsDefault: useNullAsDefaultConfig || false,
    })
  }
}
