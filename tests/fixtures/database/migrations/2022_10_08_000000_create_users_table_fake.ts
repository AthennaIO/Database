/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseMigration } from '#src'

export class UserMigration extends BaseMigration {
  public async up() {
    console.log('running up user migration')
  }

  public async down() {
    console.log('running down user migration')
  }
}
