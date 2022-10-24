/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path, String } from '@athenna/common'
import { Command, Template } from '@athenna/artisan'

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
    let [date, time] = new Date().toISOString().split('T')

    date = date.replace(/-/g, '_')
    time = time.split('.')[0].replace(/:/g, '')

    const tableName = String.pluralize(
      name.replace('Migrations', '').replace('Migration', '').toLowerCase(),
    )
    const resource = 'Migration'
    const path = Path.migrations(`${date}_${time}_create_${tableName}_table.js`)

    this.title(`MAKING ${resource}\n`, 'bold', 'green')

    Template.addProperty('nameMigrationTable', tableName)
    Template.addProperty('nameMigrationClass', String.toPascalCase(name))

    const file = await this.makeFile(path, 'migration', options.lint)

    this.success(`${resource} ({yellow} "${file.name}") successfully created.`)
  }
}
