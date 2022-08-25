/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Json } from '@secjs/utils'

export class Relation {
  static #relation = {
    isRelation: true,
  }

  /**
   * Create a oneToOne relation schema.
   *
   * This method is an alias for:
   * @example Relation.target(model).type('one-to-one').inverseSide(inverseSide).get()
   *
   * @param inverseSide {string}
   * @param model {any}
   * @param cascade {boolean}
   * @return {any}
   */
  static oneToOne(inverseSide, model, cascade = false) {
    this.#relation.cascade = cascade

    return this.target(model).type('one-to-one').inverseSide(inverseSide).get()
  }

  /**
   * Create a oneToMany relation schema.
   *
   * This method is an alias for:
   * @example Relation.target(model).type('one-to-many').inverseSide(inverseSide).get()
   *
   * @param inverseSide {string}
   * @param model {any}
   * @param cascade {boolean}
   * @return {any}
   */
  static oneToMany(inverseSide, model, cascade = false) {
    this.#relation.cascade = cascade

    return this.target(model).type('one-to-many').inverseSide(inverseSide).get()
  }

  /**
   * Create a manyToOne relation schema.
   *
   * This method is an alias for:
   * @example Relation.target(model).type('many-to-one').inverseSide(inverseSide).get()
   *
   * @param inverseSide {string}
   * @param model {any}
   * @param cascade {boolean}
   * @return {any}
   */
  static manyToOne(inverseSide, model, cascade = false) {
    this.#relation.cascade = cascade

    return this.target(model).type('many-to-one').inverseSide(inverseSide).get()
  }

  /**
   * Create a manyToMany relation schema.
   *
   * This method is an alias for:
   * @example Relation.target(model).type('many-tomany').inverseSide(inverseSide).get()
   *
   * @param inverseSide {string}
   * @param model {any}
   * @param cascade {boolean}
   * @return {any}
   */
  static manyToMany(inverseSide, model, cascade = false) {
    this.#relation.cascade = cascade

    return this.target(model)
      .type('many-to-many')
      .inverseSide(inverseSide)
      .get()
  }

  /**
   * Set the target model that your relation is pointing.
   *
   * @param model {any}
   * @return {Relation}
   */
  static target(model) {
    this.#relation.target = model.table

    return this
  }

  /**
   * Set the relation type.
   *
   * @param type {"one-to-one","one-to-many","many-to-one","many-to-many"}
   * @return {Relation}
   */
  static type(type) {
    this.#relation.type = type

    return this
  }

  /**
   * Set the inverse side of your model schema.
   *
   * @param name
   * @return {Relation}
   */
  static inverseSide(name) {
    this.#relation.inverseSide = name

    return this
  }

  /**
   * Set the column that the relation should join.
   *
   * @param column
   * @return {Relation}
   */
  static joinColumn(column) {
    if (!this.#relation.joinColumn) {
      this.#relation.joinColumn = {}
    }

    this.#relation.joinColumn.name = column

    return this
  }

  /**
   * Set if relation should be cascaded on delete/update.
   *
   * @return {Relation}
   */
  static cascade() {
    this.#relation.cascade = true

    return this
  }

  /**
   * Get the clean object built.
   *
   * @return {any}
   */
  static get() {
    const jsonColumn = Json.copy(this.#relation)

    this.#relation = { isRelation: true }

    return jsonColumn
  }
}
