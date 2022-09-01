/**
 * @athenna/artisan
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ArtisanLoader, ConsoleKernel } from '@athenna/artisan'
import { DatabaseCommandsLoader } from '#src/Helpers/DatabaseCommandsLoader'

export class Kernel extends ConsoleKernel {
  /**
   * Register the commands for the application.
   *
   * @return {Promise<any[]>}
   */
  get commands() {
    return [...ArtisanLoader.loadCommands(), ...DatabaseCommandsLoader.loadCommands()]
  }

  get templates() {
    return [...DatabaseCommandsLoader.loadTemplates()]
  }
}
