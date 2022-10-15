/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path, String } from '@secjs/utils'
import { Command, TemplateHelper } from '@athenna/artisan'

export class MakeMigration extends Command {
  /**
   * The name and signature of the console command.
   *
   * @return {string}
   */
  get signature() {
    return 'make:migration <name>'
  }

  /**
   * The console command description.
   *
   * @return {string}
   */
  get description() {
    return 'Make a new migration file.'
  }

  /**
   * Set additional flags in the commander instance.
   * This method is executed when registering your command.
   *
   * @param {import('commander').Command} commander
   * @return {import('commander').Command}
   */
  addFlags(commander) {
    return commander.option(
      '--no-lint',
      'Do not run eslint in the command.',
      true,
    )
  }

  /**
   * Execute the console command.
   *
   * @param {string} name
   * @param {any} options
   * @return {Promise<void>}
   */
  async handle(name, options) {
    const date = new Date()

    const [month, day, partialYear] = date.toLocaleString().split('/')

    const year = partialYear.split(',')[0]

    const [hour, minutes, seconds] = partialYear
      .replace(`${year}, `, '')
      .replace('AM', '')
      .replace('PM', '')
      .replace(' ', '')
      .split(':')

    const time = `${year}_${day}_${month}_${hour}${minutes}${seconds}`

    const tableName = String.pluralize(
      name.replace('Migrations', '').replace('Migration', '').toLowerCase(),
    )
    const resource = 'Migration'
    const path = Path.migrations(`${time}_create_${tableName}_table.js`)

    this.title(`MAKING ${resource}\n`, 'bold', 'green')

    TemplateHelper.addProperty('nameMigrationTable', tableName)
    TemplateHelper.addProperty('nameMigrationClass', String.toPascalCase(name))

    const file = await this.makeFile(path, 'migration', options.lint)

    this.success(`${resource} ({yellow} "${file.name}") successfully created.`)
  }
}
