/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Json } from '@secjs/utils'

export class Criteria {
  static #criteria = new Map()

  /**
   * Set the table that this query will be executed.
   *
   * @param tableName {string|any}
   * @return {typeof Criteria}
   */
  static table(tableName) {
    this.#criteria.set('table', [tableName])

    return this
  }

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {typeof Criteria}
   */
  static select(...columns) {
    this.#criteria.set('select', [columns])

    return this
  }

  /**
   * Set a include statement in your query.
   *
   * @param relation {string|any}
   * @param [callback] {any}
   * @return {typeof Criteria}
   */
  static includes(relation, callback) {
    this.#criteria.set('includes', [relation, callback])

    return this
  }

  /**
   * Set a where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [operation] {string}
   * @param [value] {any}
   * @return {typeof Criteria}
   */
  static where(statement, operation, value) {
    this.#criteria.set('where', [statement, operation, value])

    return this
  }

  /**
   * Set a or where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [operation] {string}
   * @param [value] {any}
   * @return {typeof Criteria}
   */
  static orWhere(statement, operation, value) {
    this.#criteria.set('orWhere', [statement, operation, value])

    return this
  }

  /**
   * Set a where not statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {typeof Criteria}
   */
  static whereNot(statement, value) {
    this.#criteria.set('whereNot', [statement, value])

    return this
  }

  /**
   * Set a where like statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {typeof Criteria}
   */
  static whereLike(statement, value) {
    this.#criteria.set('whereLike', [statement, value])

    return this
  }

  /**
   * Set a where ILike statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {typeof Criteria}
   */
  static whereILike(statement, value) {
    this.#criteria.set('whereILike', [statement, value])

    return this
  }

  /**
   * Set a where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {typeof Criteria}
   */
  static whereIn(columnName, values) {
    this.#criteria.set('whereIn', [columnName, values])

    return this
  }

  /**
   * Set a where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {typeof Criteria}
   */
  static whereNotIn(columnName, values) {
    this.#criteria.set('whereNotIn', [columnName, values])

    return this
  }

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {typeof Criteria}
   */
  static whereNull(columnName) {
    this.#criteria.set('whereNull', [columnName])

    return this
  }

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {typeof Criteria}
   */
  static whereNotNull(columnName) {
    this.#criteria.set('whereNotNull', [columnName])

    return this
  }

  /**
   * Set a where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {typeof Criteria}
   */
  static whereBetween(columnName, values) {
    this.#criteria.set('whereBetween', [columnName, values])

    return this
  }

  /**
   * Set a where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {typeof Criteria}
   */
  static whereNotBetween(columnName, values) {
    this.#criteria.set('whereNotBetween', [columnName, values])

    return this
  }

  /**
   * Set a order by statement in your query.
   *
   * @param columnName {string}
   * @param [direction] {'asc'|'desc'|'ASC'|'DESC'}
   * @return {typeof Criteria}
   */
  static orderBy(columnName, direction = 'ASC') {
    this.#criteria.set('orderBy', [columnName, direction])

    return this
  }

  /**
   * Set the group by in your query.
   *
   * @param columns {string}
   * @return {typeof Criteria}
   */
  static groupBy(...columns) {
    this.#criteria.set('groupBy', [columns])

    return this
  }

  /**
   * Set the offset number in your query.
   *
   * @param number {number}
   * @return {typeof Criteria}
   */
  static offset(number) {
    this.#criteria.set('offset', [number])

    return this
  }

  /**
   * Set the limit number in your query.
   *
   * @param number {number}
   * @return {typeof Criteria}
   */
  static limit(number) {
    this.#criteria.set('limit', [number])

    return this
  }

  /**
   * Get the criteria map.
   *
   * @return {Map<string, any[]>}
   */
  static get() {
    const map = Json.copy(this.#criteria)

    this.#criteria.clear()

    return map
  }
}
