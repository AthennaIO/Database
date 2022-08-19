/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { DataSource } from 'typeorm'
import { createConnection } from 'mongoose'
import { Config, Options, Parser } from '@secjs/utils'

export class ConnectionFactory {
  /**
   * Create the connection with a mongo database.
   *
   * @param {string} conName
   * @param {any} configs
   * @return {Promise<any>}
   */
  static async mongo(conName, configs) {
    return this.#mongoose(conName, configs)
  }

  /**
   * Create the connection with a mysql database.
   *
   * @param {string} conName
   * @param {any} configs
   * @return {Promise<any>}
   */
  static async mysql(conName, configs) {
    return this.#typeorm(conName, configs)
  }

  /**
   * Create the connection with a postgres database.
   *
   * @param {string} conName
   * @param {any} configs
   * @return {Promise<any>}
   */
  static async postgres(conName, configs) {
    return this.#typeorm(conName, configs)
  }

  /**
   * Create the connection with a sqlite database.
   *
   * @param {string} conName
   * @param {any} configs
   * @return {Promise<any>}
   */
  static async sqlite(conName, configs) {
    return this.#typeorm(conName, configs)
  }

  /**
   * Create the connection with a sqlserver database.
   *
   * @param {string} conName
   * @param {any} configs
   * @return {Promise<any>}
   */
  static async sqlserver(conName, configs) {
    return this.#typeorm(conName, configs)
  }

  /**
   * Merge runtime configs with default configs when it does not
   * exist.
   *
   * @param {any} defaultConfig
   * @param {any} runtimeConfig
   * @return {any}
   */
  static #mergeConfigs(defaultConfig, runtimeConfig) {
    return Options.create(runtimeConfig, defaultConfig)
  }

  /**
   * Create the connection url using configs.
   *
   * @param {any} defaultConfig
   * @param {any} runtimeConfig
   * @return {string}
   */
  static #createConUrl(defaultConfig, runtimeConfig) {
    const url = runtimeConfig.url || defaultConfig.url

    if (url) {
      const connectionObject = Parser.dbUrlToConnectionObj(url)

      if (runtimeConfig.host) connectionObject.host = runtimeConfig.host
      if (runtimeConfig.port) connectionObject.port = runtimeConfig.port
      if (runtimeConfig.user) connectionObject.user = runtimeConfig.user
      if (runtimeConfig.protocol)
        connectionObject.protocol = runtimeConfig.protocol
      if (runtimeConfig.password)
        connectionObject.password = runtimeConfig.password
      if (runtimeConfig.database)
        connectionObject.database = runtimeConfig.database

      return Parser.connectionObjToDbUrl(connectionObject)
    }

    return Parser.connectionObjToDbUrl({
      host: runtimeConfig.host || defaultConfig.host,
      port: runtimeConfig.port || defaultConfig.port,
      user: runtimeConfig.user || defaultConfig.user,
      protocol: runtimeConfig.protocol || defaultConfig.protocol,
      password: runtimeConfig.password || defaultConfig.password,
      database: runtimeConfig.database || defaultConfig.database,
      options: runtimeConfig.options || defaultConfig.options,
    })
  }

  /**
   * Create a database connection using typeorm.
   *
   * @param {string} conName
   * @param {any} runtimeConfig
   * @return {Promise<import('typeorm').DataSource>}
   */
  static async #typeorm(conName, runtimeConfig = {}) {
    const defaultConfig = Config.get(`database.connections.${conName}`)
    const configs = this.#mergeConfigs(defaultConfig, runtimeConfig)
    const typeormOptions = {}

    if (configs.url) {
      typeormOptions.url = configs.url
    } else {
      typeormOptions.type = configs.driver
      typeormOptions.host = configs.host
      typeormOptions.port = configs.port
      typeormOptions.debug = configs.debug
      typeormOptions.username = configs.user
      typeormOptions.password = configs.password
      typeormOptions.database = configs.database
      typeormOptions.entities = configs.entities
      typeormOptions.migrations = configs.migrations
      typeormOptions.synchronize = configs.synchronize
    }

    if (configs.additionalOptions) {
      Object.keys(configs.additionalOptions).forEach(
        k => (typeormOptions[k] = configs.additionalOptions[k]),
      )
    }

    const dataSource = new DataSource(typeormOptions)

    return dataSource.initialize()
  }

  /**
   * Create a database connection using mongoose.
   *
   * @param {string} conName
   * @param {any} configs
   * @return {Promise<any>}
   */
  static async #mongoose(conName, configs = {}) {
    const defaultConfig = Config.get(`database.connections.${conName}`)

    const connectionUrl = this.#createConUrl(defaultConfig, configs)

    return createConnection(connectionUrl, defaultConfig.options)
  }
}
