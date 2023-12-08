/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type ConnectionOptions = {
  /**
   * Force the connection to be created even if the
   * connection is already opened. This option is
   * useful to create a connection from scratch, meaning
   * that your driver will not use the default one. This
   * also means that is your responsibility to close this
   * connection.
   *
   * @default false
   */
  force?: boolean

  /**
   * Save your connection in the DriverFactory class.
   * If this is true, all the drivers will have a shared
   * connection to use.
   *
   * @default true
   */
  saveOnFactory?: boolean

  /**
   * Since we are using the constructor method to create
   * the connection, it could create the connection when
   * we don't really want to. To avoid creating the
   * connection is certain scenarios where you want to
   * manipulate the driver client, set this option to `false`.
   *
   * @default true
   */
  connect?: boolean
}
