import { Command } from '@athenna/artisan'
import { Database } from '#src/Facades/Database'

export class MigrationRevert extends Command {
  /**
   * The name and signature of the console command.
   *
   * @return {string}
   */
  get signature() {
    return 'migration:revert'
  }

  /**
   * The console command description.
   *
   * @return {string}
   */
  get description() {
    return 'Rollback all database migrations.'
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
      '-c, --connection <connection>',
      'Set the the database connection.',
      'default',
    )
  }

  /**
   * Execute the console command.
   *
   * @param {any} options
   * @return {Promise<void>}
   */
  async handle(options) {
    this.simpleLog(`[ REVERTING DATABASE]\n`, 'rmNewLineStart', 'bold', 'green')

    const DB = await Database.connection(options.connection).connect()

    await DB.revertMigrations()

    const dbName = await DB.getCurrentDatabase()

    await DB.close()

    this.success(
      `Database ({yellow} "${dbName}") migrations reverted successfully.`,
    )
  }
}
