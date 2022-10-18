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
   * @param model {any}
   * @param inverseSide {string}
   * @param cascade {boolean}
   * @return {any}
   */
  static hasOne(model, inverseSide, cascade = false) {
    const relation = this.model(model).type('hasOne').inverseSide(inverseSide)

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
  static hasMany(model, inverseSide, cascade = false) {
    const relation = this.model(model).type('hasMany').inverseSide(inverseSide)

    if (cascade) {
      relation.cascade()
    }

    return relation.get()
  }

  /**
   * Create a belongsTo relation schema.
   *
   * This method is an alias for:
   * @example Relation.model(model).type('belongsTo').inverseSide(inverseSide).get()
   *
   * @param model {any}
   * @param inverseSide {string}
   * @param cascade {boolean}
   * @return {any}
   */
  static belongsTo(model, inverseSide, cascade = false) {
    const relation = this.model(model)
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
   * @param pivotTable {string}
   * @param cascade {boolean}
   * @return {any}
   */
  static manyToMany(model, inverseSide, pivotTable, cascade = false) {
    const relation = this.model(model)
      .type('manyToMany')
      .inverseSide(inverseSide)

    if (cascade) {
      relation.cascade()
    }

    if (pivotTable) {
      relation.pivotTable(pivotTable)
    }

    return relation.get()
  }

  /**
   * Set the target model that your relation is pointing.
   *
   * @param model {any}
   * @return {typeof Relation}
   */
  static model(model) {
    this.#relation.model = model

    return this
  }

  /**
   * Set the relation type.
   *
   * @param type {"hasOne","hasMany","belongsTo","manyToMany"}
   * @return {typeof Relation}
   */
  static type(type) {
    this.#relation.type = type

    return this
  }

  /**
   * Set the inverse side of your model schema.
   *
   * @param name
   * @return {typeof Relation}
   */
  static inverseSide(name) {
    this.#relation.inverseSide = name

    return this
  }

  /**
   * Set the pivot table of the relation.
   *
   * @param tableName {string}
   * @return {typeof Relation}
   */
  static pivotTable(tableName) {
    this.#relation.pivotTable = tableName

    return this
  }

  /**
   * Set the pivot local foreign key of the relation.
   *
   * @param foreignKey {string}
   * @return {typeof Relation}
   */
  static pivotLocalForeignKey(foreignKey) {
    this.#relation.pivotLocalForeignKey = foreignKey

    return this
  }

  /**
   * Set the pivot relation foreign key of the relation.
   *
   * @param foreignKey {string}
   * @return {typeof Relation}
   */
  static pivotRelationForeignKey(foreignKey) {
    this.#relation.pivotRelationForeignKey = foreignKey

    return this
  }

  /**
   * Set the foreign key of the relation.
   *
   * @param column {string}
   * @return {typeof Relation}
   */
  static foreignKey(column) {
    this.#relation.foreignKey = column

    return this
  }

  /**
   * Set if relation should be cascaded on delete/update.
   *
   * @return {typeof Relation}
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
