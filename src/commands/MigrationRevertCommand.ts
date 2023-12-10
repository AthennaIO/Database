/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseCommand, Option } from '@athenna/artisan'
import { DatabaseImpl } from '#src/database/DatabaseImpl'

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

    const DB = new DatabaseImpl().connection(this.connection).connect()
    const dbName = await DB.getCurrentDatabase()

    await DB.revertMigrations().finally(() => DB.close())

    this.logger.success(
      `Successfully reverted migrations on ({yellow} "${dbName}") database.`
    )
  }
}
