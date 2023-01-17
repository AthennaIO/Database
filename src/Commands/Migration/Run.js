/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Database } from '#src/Facades/Database'
import { Command } from '@athenna/artisan'

export class MigrationRun extends Command {
  /**
   * The name and signature of the console command.
   *
   * @return {string}
   */
  get signature() {
    return 'migration:run'
  }

  /**
   * The console command description.
   *
   * @return {string}
   */
  get description() {
    return 'Run the database migrations.'
  }

  /**
   * Set additional flags in the commander instance.
   * This method is executed when registering your command.
   *
   * @param {import('@athenna/artisan').Commander} commander
   * @return {import('@athenna/artisan').Commander}
   */
  addFlags(commander) {
    return commander.option(
      '-c, --connection <connection>',
      'Set the the database connection.',
      'default',
    )
  }

  /**
   * Execute the console command.
   *
   * @param {any} options
   * @return {Promise<void>}
   */
  async handle(options) {
    this.title(`MIGRATING DATABASE\n`, 'bold', 'green')

    const DB = await Database.connection(options.connection).connect()

    await DB.runMigrations()

    const dbName = await DB.getCurrentDatabase()

    await DB.close()

    this.success(`Database ({yellow} "${dbName}") successfully migrated.`)
  }
}
