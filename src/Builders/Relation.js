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
   * Create a hasOne relation schema.
   *
   * This method is an alias for:
   * @example Relation.model(model).type('hasOne').inverseSide(inverseSide).get()
   *
   * @param inverseSide {string}
   * @param model {any}
   * @param cascade {boolean}
   * @return {any}
   */
  static hasOne(inverseSide, model, cascade = false) {
    const relation = this.target(model).type('hasOne').inverseSide(inverseSide)

    if (cascade) {
      relation.cascade()
    }

    return relation.get()
  }

  /**
   * Create a hasMany relation schema.
   *
   * This method is an alias for:
   * @example Relation.model(model).type('hasMany').inverseSide(inverseSide).get()
   *
   * @param inverseSide {string}
   * @param model {any}
   * @param cascade {boolean}
   * @return {any}
   */
  static hasMany(inverseSide, model, cascade = false) {
    const relation = this.target(model).type('hasMany').inverseSide(inverseSide)

    if (cascade) {
      relation.cascade()
    }

    return relation.get()
  }

  /**
   * Create a manyToOne relation schema.
   *
   * This method is an alias for:
   * @example Relation.model(model).type('belongsTo').inverseSide(inverseSide).get()
   *
   * @param inverseSide {string}
   * @param model {any}
   * @param cascade {boolean}
   * @return {any}
   */
  static belongsTo(inverseSide, model, cascade = false) {
    const relation = this.target(model)
      .type('belongsTo')
      .inverseSide(inverseSide)

    if (cascade) {
      relation.cascade()
    }

    return relation.get()
  }

  /**
   * Create a manyToMany relation schema.
   *
   * This method is an alias for:
   * @example Relation.model(model).type('manyToMany').inverseSide(inverseSide).get()
   *
   * @param inverseSide {string}
   * @param model {any}
   * @param cascade {boolean}
   * @return {any}
   */
  static manyToMany(inverseSide, model, cascade = false) {
    const relation = this.target(model)
      .type('manyToMany')
      .inverseSide(inverseSide)

    if (cascade) {
      relation.cascade()
    }

    return relation.get()
  }

  /**
   * Set the target model that your relation is pointing.
   *
   * @param model {any}
   * @return {this}
   */
  static model(model) {
    this.#relation.model = model

    return this
  }

  /**
   * Set the relation type.
   *
   * @param type {"hasOne","hasMany","belongsTo","manyToMany"}
   * @return {this}
   */
  static type(type) {
    this.#relation.type = type

    return this
  }

  /**
   * Set the inverse side of your model schema.
   *
   * @param name
   * @return {this}
   */
  static inverseSide(name) {
    this.#relation.inverseSide = name

    return this
  }

  /**
   * Set the column that the relation should join.
   *
   * @param column
   * @return {this}
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
   * @return {this}
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
