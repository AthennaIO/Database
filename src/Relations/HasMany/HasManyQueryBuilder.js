/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class HasManyQueryBuilder {
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

  constructor(model, options, relationQuery) {
    this.#options = options
    this.#fatherModel = model
    this.#ModelQB = relationQuery
    this.#FatherModel = model.constructor
  }

  /**
   * Calculate the average of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async avg(column) {
    return this.#ModelQB
      .where(this.#options.foreign, this.#fatherModel[this.#options.primary])
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
      .where(this.#options.foreign, this.#fatherModel[this.#options.primary])
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
      .where(this.#options.foreign, this.#fatherModel[this.#options.primary])
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
      .where(this.#options.foreign, this.#fatherModel[this.#options.primary])
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
      .where(this.#options.foreign, this.#fatherModel[this.#options.primary])
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
      .where(this.#options.foreign, this.#fatherModel[this.#options.primary])
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
      .where(this.#options.foreign, this.#fatherModel[this.#options.primary])
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
      .where(this.#options.foreign, this.#fatherModel[this.#options.primary])
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
      .where(this.#options.foreign, this.#fatherModel[this.#options.primary])
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
      .where(this.#options.foreign, this.#fatherModel[this.#options.primary])
      .countDistinct(column)
  }

  /**
   * Find one data in database or throw exception if undefined.
   *
   * @return {Promise<import('#src/index').Model>}
   */
  async findOrFail() {
    return this.#ModelQB
      .where(this.#options.foreign, this.#fatherModel[this.#options.primary])
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
      .where(this.#options.foreign, this.#fatherModel[this.#options.primary])
      .findOr(callback)
  }

  /**
   * Find one data in database.
   *
   * @return {Promise<import('#src/index').Model>}
   */
  async find() {
    return this.#ModelQB
      .where(this.#options.foreign, this.#fatherModel[this.#options.primary])
      .find()
  }

  /**
   * Find many data in database.
   *
   * @return {Promise<import('#src/index').Model[]>}
   */
  async findMany() {
    return this.#ModelQB
      .where(this.#options.foreign, this.#fatherModel[this.#options.primary])
      .findMany()
  }

  /**
   * Find many data in database and return as a Collection.
   *
   * @return {Promise<Collection<import('#src/index').Model>>}
   */
  async collection() {
    return this.#ModelQB
      .where(this.#options.foreign, this.#fatherModel[this.#options.primary])
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
      .where(this.#options.foreign, this.#fatherModel[this.#options.primary])
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
    if (!data[this.#options.foreign]) {
      data[this.#options.foreign] = this.#fatherModel[this.#options.primary]
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
      if (!data[this.#options.foreign]) {
        data[this.#options.foreign] = this.#fatherModel[this.#options.primary]
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
    if (!data[this.#options.foreign]) {
      data[this.#options.foreign] = this.#fatherModel[this.#options.primary]
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
      .where(this.#options.foreign, this.#fatherModel[this.#options.primary])
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
      .where(this.#options.foreign, this.#fatherModel[this.#options.primary])
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
   * @return {HasManyQueryBuilder}
   */
  withTrashed() {
    this.#ModelQB.withTrashed()

    return this
  }

  /**
   * Get only the soft deleted values from database.
   *
   * @return {HasManyQueryBuilder}
   */
  onlyTrashed() {
    this.#ModelQB.onlyTrashed()

    return this
  }

  /**
   * Remove the criteria from query builder by name.
   *
   * @param name {string}
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
   */
  dump() {
    this.#ModelQB.dump()

    return this
  }

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
   */
  oldest(columnName) {
    this.#ModelQB.oldest(columnName)

    return this
  }

  /**
   * Set the group by in your query.
   *
   * @param columns {string}
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
   */
  having(column, operation, value) {
    this.#ModelQB.having(column, operation, value)

    return this
  }

  /**
   * Set a having exists statement in your query.
   *
   * @param clause {any}
   * @return {HasManyQueryBuilder}
   */
  havingExists(clause) {
    this.#ModelQB.havingExists(clause)

    return this
  }

  /**
   * Set a having not exists statement in your query.
   *
   * @param clause {any}
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
   */
  havingNotBetween(columnName, values) {
    this.#ModelQB.havingNotBetween(columnName, values)

    return this
  }

  /**
   * Set a having null statement in your query.
   *
   * @param columnName {string}
   * @return {HasManyQueryBuilder}
   */
  havingNull(columnName) {
    this.#ModelQB.havingNull(columnName)

    return this
  }

  /**
   * Set a having not null statement in your query.
   *
   * @param columnName {string}
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
   */
  orHaving(column, operation, value) {
    this.#ModelQB.orHaving(column, operation, value)

    return this
  }

  /**
   * Set an or having exists statement in your query.
   *
   * @param clause {any}
   * @return {HasManyQueryBuilder}
   */
  orHavingExists(clause) {
    this.#ModelQB.orHavingExists(clause)

    return this
  }

  /**
   * Set an or having not exists statement in your query.
   *
   * @param clause {any}
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
   */
  orHavingNotBetween(columnName, values) {
    this.#ModelQB.orHavingNotBetween(columnName, values)

    return this
  }

  /**
   * Set an or having null statement in your query.
   *
   * @param columnName {string}
   * @return {HasManyQueryBuilder}
   */
  orHavingNull(columnName) {
    this.#ModelQB.orHavingNull(columnName)

    return this
  }

  /**
   * Set an or having not null statement in your query.
   *
   * @param columnName {string}
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
   */
  whereNot(statement, value) {
    this.#ModelQB.whereNot(statement, value)

    return this
  }

  /**
   * Set a where exists statement in your query.
   *
   * @param clause {any}
   * @return {HasManyQueryBuilder}
   */
  whereExists(clause) {
    this.#ModelQB.whereExists(clause)

    return this
  }

  /**
   * Set a where not exists statement in your query.
   *
   * @param clause {any}
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
   */
  whereNotBetween(columnName, values) {
    this.#ModelQB.whereNotBetween(columnName, values)

    return this
  }

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {HasManyQueryBuilder}
   */
  whereNull(columnName) {
    this.#ModelQB.whereNull(columnName)

    return this
  }

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
   */
  orWhereNot(statement, value) {
    this.#ModelQB.orWhereNot(statement, value)

    return this
  }

  /**
   * Set an or where exists statement in your query.
   *
   * @param clause {any}
   * @return {HasManyQueryBuilder}
   */
  orWhereExists(clause) {
    this.#ModelQB.orWhereExists(clause)

    return this
  }

  /**
   * Set an or where not exists statement in your query.
   *
   * @param clause {any}
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
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
   * @return {HasManyQueryBuilder}
   */
  orWhereNotBetween(columnName, values) {
    this.#ModelQB.orWhereNotBetween(columnName, values)

    return this
  }

  /**
   * Set an or where null statement in your query.
   *
   * @param columnName {string}
   * @return {HasManyQueryBuilder}
   */
  orWhereNull(columnName) {
    this.#ModelQB.orWhereNull(columnName)

    return this
  }

  /**
   * Set an or where not null statement in your query.
   *
   * @param columnName {string}
   * @return {HasManyQueryBuilder}
   */
  orWhereNotNull(columnName) {
    this.#ModelQB.orWhereNotNull(columnName)

    return this
  }

  /**
   * Set how many models should be skipped in your query.
   *
   * @param number {number}
   * @return {HasManyQueryBuilder}
   */
  offset(number) {
    this.#ModelQB.offset(number)

    return this
  }

  /**
   * Set the limit of models in your query.
   *
   * @param number {number}
   * @return {HasManyQueryBuilder}
   */
  limit(number) {
    this.#ModelQB.limit(number)

    return this
  }
}
