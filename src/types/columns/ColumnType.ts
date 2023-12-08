/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/* eslint-disable @typescript-eslint/ban-types */

import type { Schema } from 'mongoose'

export type ColumnType =
  | 'string'
  | 'uuid'
  | 'UUID'
  | 'enum'
  | 'integer'
  | 'float'
  | 'double'
  | 'numeric'
  | 'decimal'
  | 'json'
  | 'jsonb'
  | 'date'
  | 'datetime'
  | 'timestamp'
  | typeof String
  | typeof Number
  | typeof Date
  | typeof Buffer
  | typeof Boolean
  | typeof Schema.Types.UUID
  | typeof Schema.Types.BigInt
  | typeof Schema.Types.Mixed
  | typeof Schema.Types.ObjectId
  | typeof Array<any>
  | typeof Schema.Types.Decimal128
  | typeof Map<any, any>
  | typeof Schema
  | typeof BigInt
