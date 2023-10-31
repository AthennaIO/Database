/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export abstract class Seeder {
  /**
   * Run the database seeders.
   */
  public abstract run(): void | Promise<void>
}
