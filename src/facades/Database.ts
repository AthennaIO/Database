/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Facade } from '@athenna/ioc'
import { DatabaseImpl } from '#src/database/DatabaseImpl'

export const Database = Facade.createFor<DatabaseImpl>('Athenna/Core/Database')
