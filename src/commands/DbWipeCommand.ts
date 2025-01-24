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

export class DbWipeCommand extends BaseCommand {
  @Option({
    default: 'default',
    signature: '-c, --connection <connection>',
    description: 'Set the the database connection.'
  })
  public connection: string

  public static signature(): string {
    return 'db:wipe'
  }

  public static description(): string {
    return 'Drop all the tables of your database.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ WIPING DATABASE ])\n')

    const task = this.logger.task()
    const DB = Database.connection(this.connection)

    if (this.getConfig('driver') === 'mongo') {
      task.addPromise('Dropping all database tables', async () => {
        const tables = await DB.getTables()

        return tables.athenna.concurrently(table => DB.dropTable(table))
      })
    } else {
      const migrationsTable = this.getConfig(
        'migrations.tableName',
        'migrations'
      )

      task.addPromise('Reverting migrations', () => DB.revertMigrations())
      task.addPromise('Drop migrations table', () =>
        DB.dropTable(migrationsTable)
      )
    }

    await task
      .run()
      .then(async () => {
        const dbName = await DB.getCurrentDatabase()

        console.log()
        this.logger.success(
          `Database ({yellow} "${dbName}") successfully wiped.`
        )
      })
      .finally(() => DB.close())
  }

  private getConfig(name: string, defaultValue?: any) {
    return Config.get(
      `database.connections.${
        this.connection === 'default'
          ? Config.get('database.default')
          : this.connection
      }.${name}`,
      defaultValue
    )
  }
}
