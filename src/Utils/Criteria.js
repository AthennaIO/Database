import { Json } from '@secjs/utils'

export class Criteria {
  static #criteria = new Map()

  /**
   * Set the table that this query will be executed.
   *
   * @param tableName {string|any}
   * @return {Criteria}
   */
  static table(tableName) {
    this.#criteria.set('table', [tableName])

    return this
  }

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {Criteria}
   */
  static select(...columns) {
    this.#criteria.set('select', [columns])

    return this
  }

  /**
   * Set a include statement in your query.
   *
   * @param relation {string|any}
   * @param [operation] {string}
   * @return {Criteria}
   */
  static includes(relation, operation) {
    this.#criteria.set('includes', [relation, operation])

    return this
  }

  /**
   * Set a where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Criteria}
   */
  static where(statement, value) {
    this.#criteria.set('where', [statement, value])

    return this
  }

  /**
   * Set a where like statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Criteria}
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
   * @return {Criteria}
   */
  static whereILike(statement, value) {
    this.#criteria.set('whereILike', [statement, value])

    return this
  }

  /**
   * Set a where not statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Criteria}
   */
  static whereNot(statement, value) {
    this.#criteria.set('whereNot', [statement, value])

    return this
  }

  /**
   * Set a where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {Criteria}
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
   * @return {Criteria}
   */
  static whereNotIn(columnName, values) {
    this.#criteria.set('whereNotIn', [columnName, values])

    return this
  }

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {Criteria}
   */
  static whereNull(columnName) {
    this.#criteria.set('whereNull', [columnName])

    return this
  }

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {Criteria}
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
   * @return {Criteria}
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
   * @return {Criteria}
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
   * @return {Criteria}
   */
  static orderBy(columnName, direction = 'ASC') {
    this.#criteria.set('orderBy', [columnName, direction])

    return this
  }

  /**
   * Set the skip number in your query.
   *
   * @param number {number}
   * @return {Criteria}
   */
  static skip(number) {
    this.#criteria.set('skip', [number])

    return this
  }

  /**
   * Set the limit number in your query.
   *
   * @param number {number}
   * @return {Criteria}
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
