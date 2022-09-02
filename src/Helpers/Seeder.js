import { NotImplementedSeederException } from '#src/Exceptions/NotImplementedSeederException'

export class Seeder {
  /**
   * Run the database seeders.
   *
   * @return {void|Promise<void>}
   */
  run() {
    throw new NotImplementedSeederException(this.constructor.name)
  }
}
