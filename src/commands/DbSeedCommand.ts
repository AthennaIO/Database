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

export class DbSeedCommand extends BaseCommand {
  @Option({
    default: [],
    signature: '--classes <classes...>',
    description: 'Specify the classes names that should run.'
  })
  public classes: string[]

  @Option({
    default: 'default',
    signature: '-c, --connection <connection>',
    description: 'Set the the database connection.'
  })
  public connection: string

  public static signature(): string {
    return 'db:seed'
  }

  public static description(): string {
    return 'Run your application seeders.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ SEEDING DATABASE ])\n')

    const task = this.logger.task()
    const DB = Database.connection(this.connection)

    await DB.runSeeders({ task, classes: this.classes })

    await task
      .run()
      .then(async () => {
        const dbName = await DB.getCurrentDatabase()
        console.log()
        this.logger.success(
          `Database ({yellow} "${dbName}") successfully seeded.`
        )
      })
      .finally(() => DB.close())
  }
}
