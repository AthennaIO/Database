/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is, Json } from '@secjs/utils'

export class Column {
  static #column = {
    isColumn: true,
  }

  /**
   * Create an auto incremented integer primary key. Usefully for id's.
   *
   * This method is an alias for:
   * @example Column.type('increments').isPrimary().get()
   *
   * @param [name] {string}
   * @return {any}
   */
  static autoIncrementedInt(name) {
    const column = this.type('increments').isPrimary()

    if (name) {
      column.name(name)
    }

    return column.get()
  }

  /**
   * Create an auto incremented uuid primary key. Usefully for id's.
   *
   * This method is an alias for:
   * @example Column.type('uuid').isPrimary().get()
   *
   * @param [name] {string}
   * @return {any}
   */
  static autoIncrementedUuid(name) {
    const column = this.type('uuid').isPrimary()

    if (name) {
      column.name(name)
    }

    return column.get()
  }

  /**
   * Create a "string" column.
   *
   * This method is an alias for:
   * @example Column.type('varchar').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  length?: string|number,
   *  default?: any,
   *  enu?: any,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   * @param {string|number} [length]
   */
  static string(optionsOrName, length) {
    const column = this.type('varchar')

    if (!optionsOrName) {
      return column.get()
    }

    if (Is.Object(optionsOrName)) {
      Object.keys(optionsOrName).forEach(key => column[key](optionsOrName[key]))
    } else {
      column.name(optionsOrName)

      if (length) {
        column.length(length)
      }
    }

    return column.get()
  }

  /**
   * Create a "uuid" column.
   *
   * This method is an alias for:
   * @example Column.type('uuid').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  length?: string|number,
   *  default?: any,
   *  enu?: any,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   * @param {string|number} [length]
   */
  static uuid(optionsOrName, length) {
    const column = this.type('uuid')

    if (!optionsOrName) {
      return column.get()
    }

    if (Is.Object(optionsOrName)) {
      Object.keys(optionsOrName).forEach(key => column[key](optionsOrName[key]))
    } else {
      column.name(optionsOrName)

      if (length) {
        column.length(length)
      }
    }

    return column.get()
  }

  /**
   * Create an "enum" column.
   *
   * This method is an alias for:
   * @example Column.type('enum').enu(values).get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  length?: string|number,
   *  default?: any,
   *  enu?: any,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   * @param {any} [values]
   */
  static enum(optionsOrName, values) {
    const column = this.type('enum').enu(values)

    if (!optionsOrName) {
      return column.get()
    }

    if (Is.Object(optionsOrName)) {
      Object.keys(optionsOrName).forEach(key => column[key](optionsOrName[key]))
    } else {
      column.name(optionsOrName)
    }

    return column.get()
  }

  /**
   * Create an "integer" column.
   *
   * This method is an alias for:
   * @example Column.type('integer').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  default?: any,
   *  scale?: number,
   *  precision?: number,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   */
  static integer(optionsOrName) {
    const column = this.type('integer')

    if (!optionsOrName) {
      return column.get()
    }

    if (Is.Object(optionsOrName)) {
      Object.keys(optionsOrName).forEach(key => column[key](optionsOrName[key]))
    } else {
      column.name(optionsOrName)
    }

    return column.get()
  }

  /**
   * Create a "float" column.
   *
   * This method is an alias for:
   * @example Column.type('float').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  default?: any,
   *  scale?: number,
   *  precision?: number,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   */
  static float(optionsOrName) {
    const column = this.type('float')

    if (!optionsOrName) {
      return column.get()
    }

    if (Is.Object(optionsOrName)) {
      Object.keys(optionsOrName).forEach(key => column[key](optionsOrName[key]))
    } else {
      column.name(optionsOrName)
    }

    return column.get()
  }

  /**
   * Create a "double" column.
   *
   * This method is an alias for:
   * @example Column.type('double').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  default?: any,
   *  scale?: number,
   *  precision?: number,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   */
  static double(optionsOrName) {
    const column = this.type('double')

    if (!optionsOrName) {
      return column.get()
    }

    if (Is.Object(optionsOrName)) {
      Object.keys(optionsOrName).forEach(key => column[key](optionsOrName[key]))
    } else {
      column.name(optionsOrName)
    }

    return column.get()
  }

  /**
   * Create a "numeric" column.
   *
   * This method is an alias for:
   * @example Column.type('numeric').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  default?: any,
   *  scale?: number,
   *  precision?: number,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   * @param {number} [scale]
   * @param {number} [precision]
   */
  static numeric(optionsOrName, scale, precision) {
    const column = this.type('numeric')

    if (!optionsOrName) {
      return column.get()
    }

    if (Is.Object(optionsOrName)) {
      Object.keys(optionsOrName).forEach(key => column[key](optionsOrName[key]))
    } else {
      column.name(optionsOrName)

      if (scale) {
        column.scale(scale)
      }

      if (precision) {
        column.precision(precision)
      }
    }

    return column.get()
  }

  /**
   * Create a "decimal" column.
   *
   * This method is an alias for:
   * @example Column.type('decimal').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  default?: any,
   *  scale?: number,
   *  precision?: number,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @param {number} [scale]
   *  @param {number} [precision]
   */
  static decimal(optionsOrName, scale, precision) {
    const column = this.type('decimal')

    if (!optionsOrName) {
      return column.get()
    }

    if (Is.Object(optionsOrName)) {
      Object.keys(optionsOrName).forEach(key => column[key](optionsOrName[key]))
    } else {
      column.name(optionsOrName)

      if (scale) {
        column.scale(scale)
      }

      if (precision) {
        column.precision(precision)
      }
    }

    return column.get()
  }

  /**
   * Create a "json" column.
   *
   * This method is an alias for:
   * @example Column.type('json').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  default?: any,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @return {any}
   */
  static json(optionsOrName) {
    const column = this.type('json')

    if (!optionsOrName) {
      return column.get()
    }

    if (Is.Object(optionsOrName)) {
      Object.keys(optionsOrName).forEach(key => column[key](optionsOrName[key]))
    } else {
      column.name(optionsOrName)
    }

    return column.get()
  }

  /**
   * Create a "jsonb" column.
   *
   * This method is an alias for:
   * @example Column.type('jsonb').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  default?: any,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @return {any}
   */
  static jsonb(optionsOrName) {
    const column = this.type('jsonb')

    if (!optionsOrName) {
      return column.get()
    }

    if (Is.Object(optionsOrName)) {
      Object.keys(optionsOrName).forEach(key => column[key](optionsOrName[key]))
    } else {
      column.name(optionsOrName)
    }

    return column.get()
  }

  /**
   * Create a "date" column.
   *
   * This method is an alias for:
   * @example Column.type('date').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  default?: any,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @return {any}
   */
  static date(optionsOrName) {
    const column = this.type('date')

    if (!optionsOrName) {
      return column.get()
    }

    if (Is.Object(optionsOrName)) {
      Object.keys(optionsOrName).forEach(key => column[key](optionsOrName[key]))
    } else {
      column.name(optionsOrName)
    }

    return column.get()
  }

  /**
   * Create a "datetime" column.
   *
   * This method is an alias for:
   * @example Column.type('datetime').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  default?: any,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @return {any}
   */
  static datetime(optionsOrName) {
    const column = this.type('datetime')

    if (!optionsOrName) {
      return column.get()
    }

    if (Is.Object(optionsOrName)) {
      Object.keys(optionsOrName).forEach(key => column[key](optionsOrName[key]))
    } else {
      column.name(optionsOrName)
    }

    return column.get()
  }

  /**
   * Create a "timestamp" column.
   *
   * This method is an alias for:
   * @example Column.type('timestamp').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  default?: any,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @return {any}
   */
  static timestamp(optionsOrName) {
    const column = this.type('timestamp')

    if (!optionsOrName) {
      return column.get()
    }

    if (Is.Object(optionsOrName)) {
      Object.keys(optionsOrName).forEach(key => column[key](optionsOrName[key]))
    } else {
      column.name(optionsOrName)
    }

    return column.get()
  }

  /**
   * Create a "createdAt" column.
   *
   * @param [name] {string}
   * @return {any}
   */
  static createdAt(name) {
    const column = this.isCreateDate()

    if (name) {
      column.name(name)
    }

    return column.get()
  }

  /**
   * Create a "updatedAt" column.
   *
   * @param [name] {string}
   * @return {any}
   */
  static updatedAt(name) {
    const column = this.isUpdateDate()

    if (name) {
      column.name(name)
    }

    return column.get()
  }

  /**
   * Create a "deletedAt" column.
   *
   * @param [name] {string}
   * @return {any}
   */
  static deletedAt(name) {
    const column = this.type('datetime').isNullable().default(null)

    if (name) {
      column.name(name)
    }

    return column.get()
  }

  /**
   * Set the type of your column.
   *
   * @param {import('knex').Knex.TableBuilder} type
   * @return {this}
   */
  static type(type) {
    this.#column.type = type

    return this
  }

  /**
   * Set the real name of your column.
   *
   * @param {string} name
   * @return {this}
   */
  static name(name) {
    this.#column.name = name

    return this
  }

  /**
   * Set the default value of your column.
   *
   * @param {any} value
   * @return {this}
   */
  static default(value) {
    this.#column.default = value

    return this
  }

  /**
   * Set the length of your column.
   *
   * @param {string|number} length
   * @return {this}
   */
  static length(length) {
    this.#column.length = length

    return this
  }

  /**
   * Set the enum of your column.
   *
   * @param {any} enu
   * @return {this}
   */
  static enu(enu) {
    this.#column.enum = enu

    return this
  }

  /**
   * Set the scale of your column.
   *
   * @param {number} scale
   * @return {this}
   */
  static scale(scale) {
    this.#column.scale = scale

    return this
  }

  /**
   * Set the precision of your column.
   *
   * @param {number} precision
   * @return {this}
   */
  static precision(precision) {
    this.#column.precision = precision

    return this
  }

  /**
   * Set if this column should be created date.
   *
   * @param {boolean} [is]
   * @return {this}
   */
  static isCreateDate(is = true) {
    this.#column.createDate = is

    return this
  }

  /**
   * Set if this column should be updated date.
   *
   * @param {boolean} [is]
   * @return {this}
   */
  static isUpdateDate(is = true) {
    this.#column.updateDate = is

    return this
  }

  /**
   * Set if this column should be deleted date.
   *
   * @param {boolean} [is]
   * @return {this}
   */
  static isDeleteDate(is = true) {
    this.#column.deleteDate = is

    return this
  }

  /**
   * Set if this column should be hided.
   *
   * @param {boolean} [is]
   * @return {this}
   */
  static isHidden(is = true) {
    this.#column.isHidden = is

    return this
  }

  /**
   * Set if your column is primary.
   *
   * @param {boolean} [is]
   * @return {this}
   */
  static isPrimary(is = true) {
    this.#column.primary = is

    return this
  }

  /**
   * Set if your column is unique.
   *
   * @param {boolean} [is]
   * @return {this}
   */
  static isUnique(is = true) {
    this.#column.unique = is

    return this
  }

  /**
   * Set if your column is nullable.
   *
   * @param {boolean} [is]
   * @return {this}
   */
  static isNullable(is = true) {
    this.#column.nullable = is

    return this
  }

  /**
   * Get the clean object built.
   *
   * @return {any}
   */
  static get() {
    const jsonColumn = Json.copy(this.#column)

    this.#column = { isColumn: true }

    return jsonColumn
  }
}
