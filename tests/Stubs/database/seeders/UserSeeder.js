import { Seeder } from '#src/Database/Seeders/Seeder'
import { User } from '#tests/Stubs/models/User'

export class UserSeeder extends Seeder {
  /**
   * Run the database seeders.
   *
   * @return {Promise<void>}
   */
  async run() {
    await User.factory().count(10).create()
  }
}
