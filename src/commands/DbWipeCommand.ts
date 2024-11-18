/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exec } from '@athenna/common'
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

    const DB = Database.connection(this.connection)
    const task = this.logger.task()

    if (this.getConfig('driver') === 'mongo') {
      await Exec.sleep(1000)

      const tables = await DB.getTables()

      task.addPromise('Dropping all database tables', () => {
        return Exec.concurrently(tables, table => DB.dropTable(table))
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

    const dbName = await DB.getCurrentDatabase()

    await task.run().finally(() => DB.close())

    console.log()
    this.logger.success(`Database ({yellow} "${dbName}") successfully wiped.`)
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
