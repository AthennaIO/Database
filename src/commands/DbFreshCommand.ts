/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Artisan, BaseCommand, Option } from '@athenna/artisan'

export class DbWipeCommand extends BaseCommand {
  @Option({
    default: 'default',
    signature: '-c, --connection <connection>',
    description: 'Set the the database connection.'
  })
  public connection: string

  @Option({
    default: false,
    signature: '--with-seeders',
    description: 'Run seeders at the end.'
  })
  public withSeeders: boolean

  public static signature(): string {
    return 'db:fresh'
  }

  public static description(): string {
    return 'Drop all the tables of your database and run migrations again.'
  }

  public async handle(): Promise<void> {
    await Artisan.call(`db:wipe --connection ${this.connection}`)
    console.log()

    if (this.getConfig('driver') !== 'mongo') {
      await Artisan.call(`migration:run --connection ${this.connection}`)
    }

    if (this.withSeeders) {
      console.log()
      await Artisan.call(`db:seed --connection ${this.connection}`)
    }
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
