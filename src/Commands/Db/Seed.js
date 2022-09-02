import { Command } from '@athenna/artisan'
import { Database } from '#src/Facades/Database'
import { Module, Path } from '@secjs/utils'

export class DbSeed extends Command {
  /**
   * The name and signature of the console command.
   *
   * @return {string}
   */
  get signature() {
    return 'db:seed'
  }

  /**
   * The console command description.
   *
   * @return {string}
   */
  get description() {
    return 'Seed the database with records.'
  }

  /**
   * Set additional flags in the commander instance.
   * This method is executed when registering your command.
   *
   * @param {import('commander').Command} commander
   * @return {import('commander').Command}
   */
  addFlags(commander) {
    return commander
      .option(
        '-c, --connection <connection>',
        'Set the the database connection.',
        'default',
      )
      .option(
        '-c, --class <className>',
        'Set the only class that should be run.',
        null,
      )
  }

  /**
   * Execute the console command.
   *
   * @param {any} options
   * @return {Promise<void>}
   */
  async handle(options) {
    this.simpleLog('[ SEEDING DATABASE ]', 'rmNewLineStart', 'bold', 'green')

    const DB = await Database.connection(options.connection).connect()

    if (options.class) {
      const Seed = await Module.getFrom(
        Path.seeders(options.class.concat('.js')),
      )

      const seed = new Seed()

      this.success(`Running ({yellow} "${Seed.name}") seeder.`)

      await seed.run()

      await DB.close()

      return
    }

    const seeds = await Module.getAllFrom(Path.seeders())

    for (const Seed of seeds) {
      const seed = new Seed()

      this.success(`Running ({yellow} "${Seed.name}") seeder.`)

      await seed.run()
    }

    await DB.close()
  }
}
