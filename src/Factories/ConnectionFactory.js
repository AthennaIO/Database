/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { DataSource } from 'typeorm'
import { Config, Json } from '@secjs/utils'

export class ConnectionFactory {
  /**
   * Create the connection with a mysql database.
   *
   * @param {string} conName
   * @return {Promise<any>}
   */
  static async mysql(conName) {
    return this.#typeorm(conName, 'mysql')
  }

  /**
   * Create the connection with a postgres database.
   *
   * @param {string} conName
   * @return {Promise<any>}
   */
  static async postgres(conName) {
    return this.#typeorm(conName, 'postgres')
  }

  // /**
  //  * Create the connection with a sqlite database.
  //  *
  //  * @param {string} conName
  //  * @return {Promise<any>}
  //  */
  // static async sqlite(conName) {
  //   return this.#typeorm(conName, 'better-sqlite3')
  // }
  //
  // /**
  //  * Create the connection with a sqlserver database.
  //  *
  //  * @param {string} conName
  //  * @return {Promise<any>}
  //  */
  // static async sqlserver(conName) {
  //   return this.#typeorm(conName, 'mssql')
  // }

  /**
   * Create a database connection using typeorm.
   *
   * @param {string} conName
   * @param {string} type
   * @return {Promise<import('typeorm').DataSource>}
   */
  static async #typeorm(conName, type) {
    const configs = Json.copy(Config.get(`database.connections.${conName}`))

    delete configs.driver

    const dataSource = new DataSource({
      type,
      migrationsTableName: Config.get('database.migrations'),
      ...configs,
    })

    return dataSource.initialize()
  }
}
