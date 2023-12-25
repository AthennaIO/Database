/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class User {
  public static sync() {
    return true
  }

  public static schema() {
    return {
      sync: () => {}
    }
  }
}
