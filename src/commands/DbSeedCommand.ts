/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Module, Path } from '@athenna/common'
import { Database } from '#src/facades/Database'
import { BaseCommand, Option } from '@athenna/artisan'

export class DbSeedCommand extends BaseCommand {
  @Option({
    default: 'default',
    signature: 'classes...',
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

    const DB = Database.connection(this.connection).connect()
    const seeds = await Module.getAllFrom(Path.seeders())
    const task = this.logger.task()

    seeds.forEach(Seed => {
      if (this.classes.length && !this.classes.includes(Seed.name)) {
        return
      }

      task.addPromise(`Running "${Seed.name}" seeder`, new Seed().run(DB))
    })

    await task.run().finally(() => DB.close())
  }
}
