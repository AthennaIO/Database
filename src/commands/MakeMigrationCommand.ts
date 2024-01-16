/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { sep } from 'node:path'
import { Path, String } from '@athenna/common'
import { BaseCommand, Argument } from '@athenna/artisan'

export class MakeMigrationCommand extends BaseCommand {
  @Argument({
    description: 'The migration name.'
  })
  public name: string

  public static signature(): string {
    return 'make:migration'
  }

  public static description(): string {
    return 'Make a new migration file.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ MAKING MIGRATION ])\n')

    const nameUp = this.name.toUpperCase()
    const nameCamel = String.toCamelCase(this.name)
    const namePlural = String.pluralize(this.name)
    const namePascal = String.toPascalCase(this.name)
    const namePluralCamel = String.toCamelCase(String.pluralize(this.name))
    const namePluralPascal = String.toPascalCase(String.pluralize(this.name))

    const destination = Config.get(
      'rc.commands.make:migration.destination',
      Path.migrations()
    )

    const tableName = String.pluralize(
      namePascal
        .replace('Migration', '')
        .replace('Migrations', '')
        .toLowerCase()
    )

    let [date, time] = new Date().toISOString().split('T')

    date = date.replace(/-/g, '_')
    time = time.split('.')[0].replace(/:/g, '')

    const file = await this.generator
      .fileName(`${sep}${date}_${time}_create_${tableName}_table`)
      .destination(destination)
      .properties({
        nameUp,
        nameCamel,
        namePlural,
        namePascal,
        namePluralCamel,
        namePluralPascal,
        tableName
      })
      .template('migration')
      .make()

    this.logger.success(
      `Migration ({yellow} "${file.name}") successfully created.`
    )
  }
}
