/**
 * @athenna/artisan
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ArtisanLoader, ConsoleKernel } from '@athenna/artisan'
import { DatabaseLoader } from '#src/Helpers/DatabaseLoader'

export class Kernel extends ConsoleKernel {
  get commands() {
    return [...ArtisanLoader.loadCommands(), ...DatabaseLoader.loadCommands()]
  }

  get templates() {
    return [...DatabaseLoader.loadTemplates()]
  }
}
