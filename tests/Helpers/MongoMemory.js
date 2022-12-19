/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { MongoMemoryReplSet } from 'mongodb-memory-server'

export class MongoMemory {
  /**
   * Mongo replica set instance.
   *
   * @type {MongoMemoryReplSet}
   */
  static #replSet = null

  /**
   * Start the replica set.
   *
   * @return {Promise<void>}
   */
  static async start() {
    if (this.#replSet) {
      return
    }

    this.#replSet = await MongoMemoryReplSet.create({
      instanceOpts: [{ port: 27017 }, { port: 27018 }, { port: 27019 }],
      replSet: { name: 'rs', count: 3 },
    })
  }

  /**
   * Stop the replica set.
   *
   * @return {Promise<void>}
   */
  static async stop() {
    if (!this.#replSet) {
      return
    }

    await this.#replSet.stop()
    this.#replSet = null
  }
}
