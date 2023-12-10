/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path, String } from '@athenna/common'
import { sep, resolve, isAbsolute } from 'node:path'
import { BaseCommand, Argument } from '@athenna/artisan'

export class MakeMigrationCommand extends BaseCommand {
  @Argument({
    description: 'The migration name.'
  })
  public name: string

  public tableName: string

  public static signature(): string {
    return 'make:migration'
  }

  public static description(): string {
    return 'Make a new migration file.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ MAKING MIGRATION ])\n')

    const namePascal = String.toPascalCase(this.name)

    this.tableName = String.pluralize(
      namePascal
        .replace('Migration', '')
        .replace('Migrations', '')
        .toLowerCase()
    )

    const file = await this.generator
      .path(this.getFilePath())
      .properties({ nameTable: this.tableName })
      .template('migration')
      .setNameProperties(true)
      .make()

    this.logger.success(
      `Migration ({yellow} "${file.name}") successfully created.`
    )
  }

  /**
   * Get the file path where it will be generated.
   */
  private getFilePath(): string {
    let [date, time] = new Date().toISOString().split('T')

    date = date.replace(/-/g, '_')
    time = time.split('.')[0].replace(/:/g, '')

    const name = `${sep}${date}_${time}_create_${
      this.tableName
    }_table.${Path.ext()}`

    return this.getDestinationPath().concat(name)
  }

  /**
   * Get the destination path for the file that will be generated.
   */
  private getDestinationPath(): string {
    let destination = Config.get(
      'rc.commands.make:migration.destination',
      Path.migrations()
    )

    if (!isAbsolute(destination)) {
      destination = resolve(Path.pwd(), destination)
    }

    return destination
  }
}
