/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Json } from '@athenna/common'

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
   * Executes the given closure when the first argument is true.
   *
   * @param criteria {any}
   * @param callback {(query: ModelQueryBuilder, criteriaValue: any) => void}
   */
  static when(criteria, callback) {
    this.#criteria.set('when', [criteria, callback])

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
   * Set a where exists statement in your query.
   *
   * @param clause {any}
   * @return {typeof Criteria}
   */
  static whereExists(clause) {
    this.#criteria.set('whereExists', [clause])

    return this
  }

  /**
   * Set a where not exists statement in your query.
   *
   * @param clause {any}
   * @return {typeof Criteria}
   */
  static whereNotExists(clause) {
    this.#criteria.set('whereNotExists', [clause])

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
   * Set an or where exists statement in your query.
   *
   * @param clause {any}
   * @return {typeof Criteria}
   */
  static orWhereExists(clause) {
    this.#criteria.set('orWhereExists', [clause])

    return this
  }

  /**
   * Set an or where not exists statement in your query.
   *
   * @param clause {any}
   * @return {typeof Criteria}
   */
  static orWhereNotExists(clause) {
    this.#criteria.set('orWhereNotExists', [clause])

    return this
  }

  /**
   * Set an or where like statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {typeof Criteria}
   */
  static orWhereLike(statement, value) {
    this.#criteria.set('orWhereLike', [statement, value])

    return this
  }

  /**
   * Set an or where ILike statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {typeof Criteria}
   */
  static orWhereILike(statement, value) {
    this.#criteria.set('orWhereILike', [statement, value])

    return this
  }

  /**
   * Set an or where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {typeof Criteria}
   */
  static orWhereIn(columnName, values) {
    this.#criteria.set('orWhereIn', [columnName, values])

    return this
  }

  /**
   * Set an or where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {typeof Criteria}
   */
  static orWhereNotIn(columnName, values) {
    this.#criteria.set('orWhereNotIn', [columnName, values])

    return this
  }

  /**
   * Set an or where null statement in your query.
   *
   * @param columnName {string}
   * @return {typeof Criteria}
   */
  static orWhereNull(columnName) {
    this.#criteria.set('orWhereNull', [columnName])

    return this
  }

  /**
   * Set an or where not null statement in your query.
   *
   * @param columnName {string}
   * @return {typeof Criteria}
   */
  static orWhereNotNull(columnName) {
    this.#criteria.set('orWhereNotNull', [columnName])

    return this
  }

  /**
   * Set an or where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {typeof Criteria}
   */
  static orWhereBetween(columnName, values) {
    this.#criteria.set('orWhereBetween', [columnName, values])

    return this
  }

  /**
   * Set an or where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {typeof Criteria}
   */
  static orWhereNotBetween(columnName, values) {
    this.#criteria.set('orWhereNotBetween', [columnName, values])

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
   * Set having statement in your query.
   *
   * @param column {string}
   * @param operation {string}
   * @param [value] {any}
   * @return {typeof Criteria}
   */
  static having(column, operation, value) {
    this.#criteria.set('having', [column, operation, value])

    return this
  }

  /**
   * Set a having exists statement in your query.
   *
   * @param clause {any}
   * @return {typeof Criteria}
   */
  static havingExists(clause) {
    this.#criteria.set('havingExists', [clause])

    return this
  }

  /**
   * Set a having not exists statement in your query.
   *
   * @param clause {any}
   * @return {typeof Criteria}
   */
  static havingNotExists(clause) {
    this.#criteria.set('havingNotExists', [clause])

    return this
  }

  /**
   * Set a having in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {typeof Criteria}
   */
  static havingIn(columnName, values) {
    this.#criteria.set('havingIn', [columnName, values])

    return this
  }

  /**
   * Set a having not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {typeof Criteria}
   */
  static havingNotIn(columnName, values) {
    this.#criteria.set('havingNotIn', [columnName, values])

    return this
  }

  /**
   * Set a having null statement in your query.
   *
   * @param columnName {string}
   * @return {typeof Criteria}
   */
  static havingNull(columnName) {
    this.#criteria.set('havingNull', [columnName])

    return this
  }

  /**
   * Set a having not null statement in your query.
   *
   * @param columnName {string}
   * @return {typeof Criteria}
   */
  static havingNotNull(columnName) {
    this.#criteria.set('havingNotNull', [columnName])

    return this
  }

  /**
   * Set a having between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {typeof Criteria}
   */
  static havingBetween(columnName, values) {
    this.#criteria.set('havingBetween', [columnName, values])

    return this
  }

  /**
   * Set a having not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {typeof Criteria}
   */
  static havingNotBetween(columnName, values) {
    this.#criteria.set('havingNotBetween', [columnName, values])

    return this
  }

  /**
   * Set or having statement in your query.
   *
   * @param column {string}
   * @param operation {string}
   * @param [value] {any}
   * @return {typeof Criteria}
   */
  static orHaving(column, operation, value) {
    this.#criteria.set('orHaving', [column, operation, value])

    return this
  }

  /**
   * Set an or having exists statement in your query.
   *
   * @param clause {any}
   * @return {typeof Criteria}
   */
  static orHavingExists(clause) {
    this.#criteria.set('orHavingExists', [clause])

    return this
  }

  /**
   * Set an or having not exists statement in your query.
   *
   * @param clause {any}
   * @return {typeof Criteria}
   */
  static orHavingNotExists(clause) {
    this.#criteria.set('orHavingNotExists', [clause])

    return this
  }

  /**
   * Set an or having in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {typeof Criteria}
   */
  static orHavingIn(columnName, values) {
    this.#criteria.set('orHavingIn', [columnName, values])

    return this
  }

  /**
   * Set an or having not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {typeof Criteria}
   */
  static orHavingNotIn(columnName, values) {
    this.#criteria.set('orHavingNotIn', [columnName, values])

    return this
  }

  /**
   * Set an or having null statement in your query.
   *
   * @param columnName {string}
   * @return {typeof Criteria}
   */
  static orHavingNull(columnName) {
    this.#criteria.set('orHavingNull', [columnName])

    return this
  }

  /**
   * Set an or having not null statement in your query.
   *
   * @param columnName {string}
   * @return {typeof Criteria}
   */
  static orHavingNotNull(columnName) {
    this.#criteria.set('orHavingNotNull', [columnName])

    return this
  }

  /**
   * Set an or having between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {typeof Criteria}
   */
  static orHavingBetween(columnName, values) {
    this.#criteria.set('orHavingBetween', [columnName, values])

    return this
  }

  /**
   * Set an or having not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {typeof Criteria}
   */
  static orHavingNotBetween(columnName, values) {
    this.#criteria.set('orHavingNotBetween', [columnName, values])

    return this
  }

  /**
   * Order the results easily by the latest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   *
   * @param [columnName] {string}
   * @return {typeof Criteria}
   */
  static latest(columnName = 'createdAt') {
    this.#criteria.set('latest', [columnName])

    return this
  }

  /**
   * Order the results easily by the oldest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   *
   * @param [columnName] {string}
   * @return {typeof Criteria}
   */
  static oldest(columnName = 'createdAt') {
    this.#criteria.set('oldest', [columnName])

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
