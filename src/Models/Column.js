/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Json } from '@secjs/utils'

export class Column {
  static #column = {
    isColumn: true,
  }

  /**
   * Create an auto incremented integer primary key. Usefully for id's.
   *
   * This method is an alias for:
   * @example Column.type('int').isGenerated().isPrimary().get()
   *
   * @param [name] {string}
   * @return {any}
   */
  static autoIncrementedInt(name) {
    const column = this.type('int').isGenerated().isPrimary()

    if (name) {
      column.name(name)
    }

    return column.get()
  }

  /**
   * Create an auto incremented uuid primary key. Usefully for id's.
   *
   * This method is an alias for:
   * @example Column.type('uuid').isGenerated().isPrimary().get()
   *
   * @param [name] {string}
   * @return {any}
   */
  static autoIncrementedUuid(name) {
    const column = this.type('uuid').isGenerated().isPrimary()

    if (name) {
      column.name(name)
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
    const column = this.isDeleteDate()

    if (name) {
      column.name(name)
    }

    return column.get()
  }

  /**
   * Set the type of your column.
   *
   * @return {this}
   */
  static type(type) {
    this.#column.type = type

    return this
  }

  /**
   * Set the real name of your column.
   *
   * @return {this}
   */
  static name(name) {
    this.#column.name = name

    return this
  }

  /**
   * Set the default value of your column.
   *
   * @return {this}
   */
  static default(value) {
    this.#column.default = value

    return this
  }

  /**
   * Set if this column should be created date.
   *
   * @return {this}
   */
  static isCreateDate() {
    this.#column.createDate = true

    return this
  }

  /**
   * Set if this column should be updated date.
   *
   * @return {this}
   */
  static isUpdateDate() {
    this.#column.updateDate = true

    return this
  }

  /**
   * Set if this column should be deleted date.
   *
   * @return {this}
   */
  static isDeleteDate() {
    this.#column.deleteDate = true

    return this
  }

  /**
   * Set if this column should be hided.
   *
   * @return {this}
   */
  static isHidden() {
    this.#column.select = false

    return this
  }

  /**
   * Set if your column is auto generated.
   *
   * @return {this}
   */
  static isGenerated() {
    this.#column.generated = true

    return this
  }

  /**
   * Set if your column is primary.
   *
   * @return {this}
   */
  static isPrimary() {
    this.#column.primary = true

    return this
  }

  /**
   * Set if your column is unique.
   *
   * @return {this}
   */
  static isUnique() {
    this.#column.unique = true

    return this
  }

  /**
   * Set if your column is nullable.
   *
   * @return {this}
   */
  static isNullable() {
    this.#column.nullable = true

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
