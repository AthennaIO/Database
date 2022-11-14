/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ModelQueryBuilder } from '#src/Models/ModelQueryBuilder'

export class BelongsToQueryBuilder {
  /**
   * The relation options.
   *
   * @return {any}
   */
  #options

  /**
   * The father model instance class.
   *
   * @return {import('#src/index').Model}
   */
  #fatherModel

  /**
   * The father model class.
   *
   * @return {typeof import('#src/index').Model}
   */
  #FatherModel

  /**
   * The relation model query builder instance.
   *
   * @return {ModelQueryBuilder}
   */
  #ModelQB

  constructor(model, RelationModel, withCriterias, options) {
    this.#options = options
    this.#fatherModel = model
    this.#FatherModel = model.constructor

    this.#ModelQB = new ModelQueryBuilder(RelationModel, withCriterias)
  }

  /**
   * Calculate the average of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async avg(column) {
    return this.#ModelQB
      .where(this.#options.primary, this.#fatherModel[this.#options.foreign])
      .avg(column)
  }

  /**
   * Calculate the average of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async avgDistinct(column) {
    return this.#ModelQB
      .where(this.#options.primary, this.#fatherModel[this.#options.foreign])
      .avgDistinct(column)
  }

  /**
   * Get the max number of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async max(column) {
    return this.#ModelQB
      .where(this.#options.primary, this.#fatherModel[this.#options.foreign])
      .max(column)
  }

  /**
   * Get the min number of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async min(column) {
    return this.#ModelQB
      .where(this.#options.primary, this.#fatherModel[this.#options.foreign])
      .min(column)
  }

  /**
   * Sum all numbers of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async sum(column) {
    return this.#ModelQB
      .where(this.#options.primary, this.#fatherModel[this.#options.foreign])
      .sum(column)
  }

  /**
   * Sum all numbers of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async sumDistinct(column) {
    return this.#ModelQB
      .where(this.#options.primary, this.#fatherModel[this.#options.foreign])
      .sumDistinct(column)
  }

  /**
   * Increment a value of a given column.
   *
   * @param {string} column
   * @return {Promise<number | number[]>}
   */
  async increment(column) {
    return this.#ModelQB
      .where(this.#options.primary, this.#fatherModel[this.#options.foreign])
      .increment(column)
  }

  /**
   * Decrement a value of a given column.
   *
   * @param {string} column
   * @return {Promise<number | number[]>}
   */
  async decrement(column) {
    return this.#ModelQB
      .where(this.#options.primary, this.#fatherModel[this.#options.foreign])
      .decrement(column)
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async count(column = '*') {
    return this.#ModelQB
      .where(this.#options.primary, this.#fatherModel[this.#options.foreign])
      .count(column)
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async countDistinct(column) {
    return this.#ModelQB
      .where(this.#options.primary, this.#fatherModel[this.#options.foreign])
      .countDistinct(column)
  }

  /**
   * Find one data in database or throw exception if undefined.
   *
   * @return {Promise<import('#src/index').Model>}
   */
  async findOrFail() {
    return this.#ModelQB
      .where(this.#options.primary, this.#fatherModel[this.#options.foreign])
      .findOrFail()
  }

  /**
   * Return a single model instance or, if no results are found,
   * execute the given closure.
   *
   * @return {Promise<import('#src/index').Model | any>}
   */
  async findOr(callback) {
    return this.#ModelQB
      .where(this.#options.primary, this.#fatherModel[this.#options.foreign])
      .findOr(callback)
  }

  /**
   * Find one data in database.
   *
   * @return {Promise<import('#src/index').Model>}
   */
  async find() {
    return this.#ModelQB
      .where(this.#options.primary, this.#fatherModel[this.#options.foreign])
      .find()
  }

  /**
   * Find many data in database.
   *
   * @return {Promise<import('#src/index').Model[]>}
   */
  async findMany() {
    return this.#ModelQB
      .where(this.#options.primary, this.#fatherModel[this.#options.foreign])
      .findMany()
  }

  /**
   * Find many data in database and return as a Collection.
   *
   * @return {Promise<Collection<import('#src/index').Model>>}
   */
  async collection() {
    return this.#ModelQB
      .where(this.#options.primary, this.#fatherModel[this.#options.foreign])
      .collection()
  }

  /**
   * Find many models in database and return as paginated response.
   *
   * @param [page] {boolean}
   * @param [limit] {boolean}
   * @param [resourceUrl] {string}
   * @return {Promise<{
   *   data: import('#src/index').Model[],
   *   meta: {
   *     totalItems: number,
   *     itemsPerPage: number,
   *     totalPages: number,
   *     currentPage: number,
   *     itemCount: number,
   *   },
   *   links: {
   *     next: string,
   *     previous: string,
   *     last: string,
   *     first: string
   *   }
   * }>}
   */
  async paginate(page = 0, limit = 10, resourceUrl = '/') {
    return this.#ModelQB
      .where(this.#options.primary, this.#fatherModel[this.#options.foreign])
      .paginate(page, limit, resourceUrl)
  }

  /**
   * Create one model in database.
   *
   * @param data {any}
   * @param {boolean} ignorePersistOnly
   * @return {Promise<import('#src/index').Model>}
   */
  async create(data, ignorePersistOnly = false) {
    if (!data[this.#options.primary]) {
      data[this.#options.primary] = this.#fatherModel[this.#options.foreign]
    }

    return this.#ModelQB.create(data, ignorePersistOnly)
  }

  /**
   * Create many models in database.
   *
   * @param data {any}
   * @param {boolean} ignorePersistOnly
   * @return {Promise<import('#src/index').Model[]>}
   */
  async createMany(data, ignorePersistOnly = false) {
    data = data.map(data => {
      if (!data[this.#options.primary]) {
        data[this.#options.primary] = this.#fatherModel[this.#options.foreign]
      }

      return data
    })

    return this.#ModelQB.createMany(data, ignorePersistOnly)
  }

  /**
   * Create or update models in database.
   *
   * @param data {any}
   * @param {boolean} ignorePersistOnly
   * @return {Promise<import('#src/index').Model | import('#src/index').Model[]>}
   */
  async createOrUpdate(data, ignorePersistOnly = false) {
    if (!data[this.#options.primary]) {
      data[this.#options.primary] = this.#fatherModel[this.#options.foreign]
    }

    return this.#ModelQB.createOrUpdate(data, ignorePersistOnly)
  }

  /**
   * Update one or more models in database.
   *
   * @param data {any}
   * @param {boolean} ignorePersistOnly
   * @return {Promise<import('#src/index').Model | import('#src/index').Model[]>}
   */
  async update(data, ignorePersistOnly = false) {
    return this.#ModelQB
      .where(this.#options.primary, this.#fatherModel[this.#options.foreign])
      .update(data, ignorePersistOnly)
  }

  /**
   * Delete one or more models in database.
   *
   * @param [force] {boolean}
   * @return {Promise<import('#src/index').Model | import('#src/index').Model[] | void>}
   */
  async delete(force = false) {
    return this.#ModelQB
      .where(this.#options.primary, this.#fatherModel[this.#options.foreign])
      .delete(force)
  }

  /**
   * Restore a soft deleted models from database.
   *
   * @return {Promise<import('#src/index').Model | import('#src/index').Model[]>}
   */
  async restore() {
    return this.update({ deletedAt: null }, true)
  }

  /**
   * Get all the records even the soft deleted.
   *
   * @return {BelongsToQueryBuilder}
   */
  withTrashed() {
    this.#ModelQB.withTrashed()

    return this
  }

  /**
   * Get only the soft deleted values from database.
   *
   * @return {BelongsToQueryBuilder}
   */
  onlyTrashed() {
    this.#ModelQB.onlyTrashed()

    return this
  }

  /**
   * Remove the criteria from query builder by name.
   *
   * @param name {string}
   * @return {BelongsToQueryBuilder}
   */
  removeCriteria(name) {
    this.#ModelQB.removeCriteria(name)

    return this
  }

  /**
   * Executes the given closure when the first argument is true.
   *
   * @param criteria {any}
   * @param callback {(query: ModelQueryBuilder, criteriaValue: any) => void}
   */
  when(criteria, callback) {
    this.#ModelQB.when(criteria, callback)

    return this
  }

  /**
   * Log in console the actual query built.
   *
   * @return {BelongsToQueryBuilder}
   */
  dump() {
    this.#ModelQB.dump()

    return this
  }

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {BelongsToQueryBuilder}
   */
  select(...columns) {
    this.#ModelQB.select(...columns)

    return this
  }

  /**
   * Set the order in your query.
   *
   * @param [columnName] {string}
   * @param [direction] {'asc'|'desc'|'ASC'|'DESC'}
   * @return {BelongsToQueryBuilder}
   */
  orderBy(columnName, direction) {
    this.#ModelQB.orderBy(columnName, direction)

    return this
  }

  /**
   * Order the results easily by the latest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   *
   * @param [columnName] {string}
   * @return {BelongsToQueryBuilder}
   */
  latest(columnName) {
    this.#ModelQB.latest(columnName)

    return this
  }

  /**
   * Order the results easily by the oldest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   *
   * @param [columnName] {string}
   * @return {BelongsToQueryBuilder}
   */
  oldest(columnName) {
    this.#ModelQB.oldest(columnName)

    return this
  }

  /**
   * Set the group by in your query.
   *
   * @param columns {string}
   * @return {BelongsToQueryBuilder}
   */
  groupBy(...columns) {
    this.#ModelQB.groupBy(...columns)

    return this
  }

  /**
   * Set a having statement in your query.
   *
   * @param column {string}
   * @param operation {string}
   * @param [value] {any}
   * @return {BelongsToQueryBuilder}
   */
  having(column, operation, value) {
    this.#ModelQB.having(column, operation, value)

    return this
  }

  /**
   * Set a having exists statement in your query.
   *
   * @param clause {any}
   * @return {BelongsToQueryBuilder}
   */
  havingExists(clause) {
    this.#ModelQB.havingExists(clause)

    return this
  }

  /**
   * Set a having not exists statement in your query.
   *
   * @param clause {any}
   * @return {BelongsToQueryBuilder}
   */
  havingNotExists(clause) {
    this.#ModelQB.havingNotExists(clause)

    return this
  }

  /**
   * Set a having in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {BelongsToQueryBuilder}
   */
  havingIn(columnName, values) {
    this.#ModelQB.havingIn(columnName, values)

    return this
  }

  /**
   * Set a having not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {BelongsToQueryBuilder}
   */
  havingNotIn(columnName, values) {
    this.#ModelQB.havingNotIn(columnName, values)

    return this
  }

  /**
   * Set a having between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {BelongsToQueryBuilder}
   */
  havingBetween(columnName, values) {
    this.#ModelQB.havingBetween(columnName, values)

    return this
  }

  /**
   * Set a having not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {BelongsToQueryBuilder}
   */
  havingNotBetween(columnName, values) {
    this.#ModelQB.havingNotBetween(columnName, values)

    return this
  }

  /**
   * Set a having null statement in your query.
   *
   * @param columnName {string}
   * @return {BelongsToQueryBuilder}
   */
  havingNull(columnName) {
    this.#ModelQB.havingNull(columnName)

    return this
  }

  /**
   * Set a having not null statement in your query.
   *
   * @param columnName {string}
   * @return {BelongsToQueryBuilder}
   */
  havingNotNull(columnName) {
    this.#ModelQB.havingNotNull(columnName)

    return this
  }

  /**
   * Set an or having statement in your query.
   *
   * @param column {string}
   * @param operation {string}
   * @param [value] {any}
   * @return {BelongsToQueryBuilder}
   */
  orHaving(column, operation, value) {
    this.#ModelQB.orHaving(column, operation, value)

    return this
  }

  /**
   * Set an or having exists statement in your query.
   *
   * @param clause {any}
   * @return {BelongsToQueryBuilder}
   */
  orHavingExists(clause) {
    this.#ModelQB.orHavingExists(clause)

    return this
  }

  /**
   * Set an or having not exists statement in your query.
   *
   * @param clause {any}
   * @return {BelongsToQueryBuilder}
   */
  orHavingNotExists(clause) {
    this.#ModelQB.orHavingNotExists(clause)

    return this
  }

  /**
   * Set an or having in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {BelongsToQueryBuilder}
   */
  orHavingIn(columnName, values) {
    this.#ModelQB.orHavingIn(columnName, values)

    return this
  }

  /**
   * Set an or having not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {BelongsToQueryBuilder}
   */
  orHavingNotIn(columnName, values) {
    this.#ModelQB.orHavingNotIn(columnName, values)

    return this
  }

  /**
   * Set an or having between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {BelongsToQueryBuilder}
   */
  orHavingBetween(columnName, values) {
    this.#ModelQB.orHavingBetween(columnName, values)

    return this
  }

  /**
   * Set an or having not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {BelongsToQueryBuilder}
   */
  orHavingNotBetween(columnName, values) {
    this.#ModelQB.orHavingNotBetween(columnName, values)

    return this
  }

  /**
   * Set an or having null statement in your query.
   *
   * @param columnName {string}
   * @return {BelongsToQueryBuilder}
   */
  orHavingNull(columnName) {
    this.#ModelQB.orHavingNull(columnName)

    return this
  }

  /**
   * Set an or having not null statement in your query.
   *
   * @param columnName {string}
   * @return {BelongsToQueryBuilder}
   */
  orHavingNotNull(columnName) {
    this.#ModelQB.orHavingNotNull(columnName)

    return this
  }

  /**
   * Eager load a relation in your query.
   *
   * @param relationName {string|any}
   * @param [callback] {(query: ModelQueryBuilder) => void | Promise<void> | ModelQueryBuilder | Promise<ModelQueryBuilder>}
   * @return {BelongsToQueryBuilder}
   */
  with(relationName, callback) {
    this.#ModelQB.with(relationName, callback)

    return this
  }

  /**
   * Set a where statement in your query.
   *
   * @param statement {any}
   * @param [operation] {string}
   * @param [value] {any}
   * @return {BelongsToQueryBuilder}
   */
  where(statement, operation, value) {
    this.#ModelQB.where(statement, operation, value)

    return this
  }

  /**
   * Set a where not statement in your query.
   *
   * @param statement {any}
   * @param [value] {any}
   * @return {BelongsToQueryBuilder}
   */
  whereNot(statement, value) {
    this.#ModelQB.whereNot(statement, value)

    return this
  }

  /**
   * Set a where exists statement in your query.
   *
   * @param clause {any}
   * @return {BelongsToQueryBuilder}
   */
  whereExists(clause) {
    this.#ModelQB.whereExists(clause)

    return this
  }

  /**
   * Set a where not exists statement in your query.
   *
   * @param clause {any}
   * @return {BelongsToQueryBuilder}
   */
  whereNotExists(clause) {
    this.#ModelQB.whereNotExists(clause)

    return this
  }

  /**
   * Set a where like statement in your query.
   *
   * @param statement {any}
   * @param [value] {any}
   * @return {BelongsToQueryBuilder}
   */
  whereLike(statement, value) {
    this.#ModelQB.whereLike(statement, value)

    return this
  }

  /**
   * Set a where ILike statement in your query.
   *
   * @param statement {any}
   * @param [value] {any}
   * @return {BelongsToQueryBuilder}
   */
  whereILike(statement, value) {
    this.#ModelQB.whereILike(statement, value)

    return this
  }

  /**
   * Set a where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {BelongsToQueryBuilder}
   */
  whereIn(columnName, values) {
    this.#ModelQB.whereIn(columnName, values)

    return this
  }

  /**
   * Set a where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {BelongsToQueryBuilder}
   */
  whereNotIn(columnName, values) {
    this.#ModelQB.whereNotIn(columnName, values)

    return this
  }

  /**
   * Set a where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {BelongsToQueryBuilder}
   */
  whereBetween(columnName, values) {
    this.#ModelQB.whereBetween(columnName, values)

    return this
  }

  /**
   * Set a where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {BelongsToQueryBuilder}
   */
  whereNotBetween(columnName, values) {
    this.#ModelQB.whereNotBetween(columnName, values)

    return this
  }

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {BelongsToQueryBuilder}
   */
  whereNull(columnName) {
    this.#ModelQB.whereNull(columnName)

    return this
  }

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {BelongsToQueryBuilder}
   */
  whereNotNull(columnName) {
    this.#ModelQB.whereNotNull(columnName)

    return this
  }

  /**
   * Set a or where statement in your query.
   *
   * @param statement {any}
   * @param [operation] {string}
   * @param [value] {any}
   * @return {BelongsToQueryBuilder}
   */
  orWhere(statement, operation, value) {
    this.#ModelQB.orWhere(statement, operation, value)

    return this
  }

  /**
   * Set an or where not statement in your query.
   *
   * @param statement {any}
   * @param [value] {any}
   * @return {BelongsToQueryBuilder}
   */
  orWhereNot(statement, value) {
    this.#ModelQB.orWhereNot(statement, value)

    return this
  }

  /**
   * Set an or where exists statement in your query.
   *
   * @param clause {any}
   * @return {BelongsToQueryBuilder}
   */
  orWhereExists(clause) {
    this.#ModelQB.orWhereExists(clause)

    return this
  }

  /**
   * Set an or where not exists statement in your query.
   *
   * @param clause {any}
   * @return {BelongsToQueryBuilder}
   */
  orWhereNotExists(clause) {
    this.#ModelQB.orWhereNotExists(clause)

    return this
  }

  /**
   * Set an or where like statement in your query.
   *
   * @param statement {any}
   * @param [value] {any}
   * @return {BelongsToQueryBuilder}
   */
  orWhereLike(statement, value) {
    this.#ModelQB.orWhereLike(statement, value)

    return this
  }

  /**
   * Set an or where ILike statement in your query.
   *
   * @param statement {any}
   * @param [value] {any}
   * @return {BelongsToQueryBuilder}
   */
  orWhereILike(statement, value) {
    this.#ModelQB.orWhereILike(statement, value)

    return this
  }

  /**
   * Set an or where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {BelongsToQueryBuilder}
   */
  orWhereIn(columnName, values) {
    this.#ModelQB.orWhereIn(columnName, values)

    return this
  }

  /**
   * Set an or where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {BelongsToQueryBuilder}
   */
  orWhereNotIn(columnName, values) {
    this.#ModelQB.orWhereNotIn(columnName, values)

    return this
  }

  /**
   * Set an or where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {BelongsToQueryBuilder}
   */
  orWhereBetween(columnName, values) {
    this.#ModelQB.orWhereBetween(columnName, values)

    return this
  }

  /**
   * Set an or where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {BelongsToQueryBuilder}
   */
  orWhereNotBetween(columnName, values) {
    this.#ModelQB.orWhereNotBetween(columnName, values)

    return this
  }

  /**
   * Set an or where null statement in your query.
   *
   * @param columnName {string}
   * @return {BelongsToQueryBuilder}
   */
  orWhereNull(columnName) {
    this.#ModelQB.orWhereNull(columnName)

    return this
  }

  /**
   * Set an or where not null statement in your query.
   *
   * @param columnName {string}
   * @return {BelongsToQueryBuilder}
   */
  orWhereNotNull(columnName) {
    this.#ModelQB.orWhereNotNull(columnName)

    return this
  }

  /**
   * Set how many models should be skipped in your query.
   *
   * @param number {number}
   * @return {BelongsToQueryBuilder}
   */
  offset(number) {
    this.#ModelQB.offset(number)

    return this
  }

  /**
   * Set the limit of models in your query.
   *
   * @param number {number}
   * @return {BelongsToQueryBuilder}
   */
  limit(number) {
    this.#ModelQB.limit(number)

    return this
  }
}
