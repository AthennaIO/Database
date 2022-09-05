import { Path } from '@secjs/utils'
import { Command } from '@athenna/artisan'

export class MakeSeeder extends Command {
  /**
   * The name and signature of the console command.
   *
   * @return {string}
   */
  get signature() {
    return 'make:seeder <name>'
  }

  /**
   * The console command description.
   *
   * @return {string}
   */
  get description() {
    return 'Make a new seeder file.'
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
    const resource = 'Seeder'
    const path = Path.seeders(`${name}.js`)

    this.title(`MAKING ${resource}\n`, 'bold', 'green')

    const file = await this.makeFile(path, 'seeder', options.lint)

    this.success(`${resource} ({yellow} "${file.name}") successfully created.`)
  }
}
