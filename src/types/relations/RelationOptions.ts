/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { HasOneOptions } from '#src/types/relations/HasOneOptions'
import type { BelongsToOptions } from '#src/types/relations/BelongsToOptions'

export type RelationOptions = HasOneOptions | BelongsToOptions
