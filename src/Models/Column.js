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
   * @return {any}
   */
  static autoIncrementedIntPk() {
    return this.type('int').isGenerated().isPrimary().get()
  }

  /**
   * Create a "createdAt" column.
   *
   * This method is an alias for:
   * @example Column.type('timestamp').default('now()').get()
   *
   * @return {any}
   */
  static createdAt() {
    return this.type('timestamp').default('now()').get()
  }

  /**
   * Create a "updatedAt" column.
   *
   * This method is an alias for:
   * @example Column.type('timestamp').default('now()').get()
   *
   * @return {any}
   */
  static updatedAt() {
    return this.type('timestamp').default('now()').get()
  }

  /**
   * Create a "deletedAt" column.
   *
   * This method is an alias for:
   * @example Column.type('timestamp').default(null).isNullable().get()
   *
   * @return {any}
   */
  static deletedAt() {
    return this.type('timestamp').default(null).isNullable().get()
  }

  /**
   * Set the type of your column.
   *
   * @return {Column}
   */
  static type(type) {
    this.#column.type = type

    return this
  }

  /**
   * Set the default value of your column.
   *
   * @return {Column}
   */
  static default(value) {
    this.#column.default = value

    return this
  }

  /**
   * Set if this column should be hidded.
   */
  static isHidden() {
    this.#column.select = false

    return this
  }

  /**
   * Set if your column is auto generated.
   *
   * @return {Column}
   */
  static isGenerated() {
    this.#column.generated = true

    return this
  }

  /**
   * Set if your column is primary.
   *
   * @return {Column}
   */
  static isPrimary() {
    this.#column.primary = true

    return this
  }

  /**
   * Set if your column is unique.
   *
   * @return {Column}
   */
  static isUnique() {
    this.#column.unique = true

    return this
  }

  /**
   * Set if your column is nullable.
   *
   * @return {Column}
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
