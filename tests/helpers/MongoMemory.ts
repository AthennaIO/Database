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
   */
  public static replSet: MongoMemoryReplSet = null

  /**
   * Start the replica set.
   */
  public static async start(): Promise<void> {
    if (this.replSet) {
      return
    }

    this.replSet = await MongoMemoryReplSet.create({
      instanceOpts: [{ port: 27017 }],
      replSet: { name: 'rs', count: 1 }
    })

    console.log('##### STARTING MONGODB MEMORY SERVER #####')
  }

  /**
   * Stop the replica set.
   */
  public static async stop(): Promise<void> {
    if (!this.replSet) {
      return
    }

    await this.replSet.stop()
    this.replSet = null

    console.log('##### STOPPING MONGODB MEMORY SERVER #####')
  }
}
