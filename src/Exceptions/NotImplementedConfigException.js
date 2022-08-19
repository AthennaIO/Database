/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config, Exception } from '@secjs/utils'

export class NotImplementedConfigException extends Exception {
  /**
   * Creates a new instance of NotImplementedConfigException.
   *
   * @param {string} conName
   * @return {NotImplementedConfigException}
   */
  constructor(conName) {
    const content = `Connection ${conName} is not configured inside database.connections object from config/database file.`
    const availableConfigs = Object.keys(
      Config.get('database.connections'),
    ).join(', ')

    super(
      content,
      500,
      'E_NOT_IMPLEMENTED_CONFIG_ERROR',
      `Available configurations are: ${availableConfigs}. Create your configuration inside connections object to use it.`,
    )
  }
}
