/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { Exception } from '@athenna/common'

export class NotImplementedConfigException extends Exception {
  /**
   * Creates a new instance of NotImplementedConfigException.
   *
   * @param {string} conName
   * @return {NotImplementedConfigException}
   */
  constructor(conName) {
    const content = `Connection ${conName} is not configured inside database.connections object from config/database file.`

    let help = ''

    if (Config.get('database.connections')) {
      const availableConfigs = Object.keys(
        Config.get('database.connections'),
      ).join(', ')

      help += `Available configurations are: ${availableConfigs}.`
    } else {
      help += `The "Config.get('database.connections') is empty, maybe your configuration files are not loaded?`
    }

    help += ` Create your configuration inside connections object to use it. Or load your configuration files using "new Config().safeLoad(Path.config('database.js'))`

    super(content, 500, 'E_NOT_IMPLEMENTED_CONFIG_ERROR', help)
  }
}
