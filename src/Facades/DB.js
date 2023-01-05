/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Facade } from '@athenna/ioc'

/**
 * @type {typeof Facade & import('#src/index').DatabaseImpl}
 */
export const DB = Facade.createFor('Athenna/Core/Database')
