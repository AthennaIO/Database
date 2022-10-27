/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { DatabaseLoader } from '#src/Helpers/DatabaseLoader'
import { ArtisanLoader, ConsoleKernel } from '@athenna/artisan'

export class Kernel extends ConsoleKernel {
  get commands() {
    return [...ArtisanLoader.loadCommands(), ...DatabaseLoader.loadCommands()]
  }

  get templates() {
    return [...DatabaseLoader.loadTemplates()]
  }
}
