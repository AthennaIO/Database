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

export class MigrationRunCommand extends BaseCommand {
  @Option({
    default: 'default',
    signature: '-c, --connection <connection>',
    description: 'Set the the database connection.'
  })
  public connection: string

  public static signature(): string {
    return 'migration:run'
  }

  public static description(): string {
    return 'Run your application migrations.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ RUNNING MIGRATIONS ])\n')

    if (Config.is(`database.connections.${this.connection}.driver`, 'mongo')) {
      this.logger.warn(
        `Connection ({yellow} "${this.connection}") is using ({yellow} "mongo") driver and migrations run will be skipped.`
      )

      return
    }

    const DB = Database.connection(this.connection)

    await DB.runMigrations()
      .then(async () => {
        const dbName = await DB.getCurrentDatabase()

        this.logger.success(
          `Successfully ran migrations on ({yellow} "${dbName}") database.`
        )
      })
      .finally(() => DB.close())
  }
}
