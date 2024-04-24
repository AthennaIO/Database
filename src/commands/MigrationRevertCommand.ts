/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Database } from '#src/facades/Database'
import { BaseCommand, Option } from '@athenna/artisan'

export class MigrationRevertCommand extends BaseCommand {
  @Option({
    default: 'default',
    signature: '-c, --connection <connection>',
    description: 'Set the the database connection.'
  })
  public connection: string

  public static signature(): string {
    return 'migration:revert'
  }

  public static description(): string {
    return 'Revert your application migrations.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ REVERTING MIGRATIONS ])\n')

    if (Config.is(`database.connections.${this.connection}.driver`, 'mongo')) {
      this.logger.warn(
        `Connection ({yellow} "${this.connection}") is using ({yellow} "mongo") driver and migrations revert will be skipped.`
      )

      return
    }

    const DB = Database.connection(this.connection)
    const dbName = await DB.getCurrentDatabase()

    await DB.revertMigrations().finally(() => DB.close())

    this.logger.success(
      `Successfully reverted migrations on ({yellow} "${dbName}") database.`
    )
  }
}
