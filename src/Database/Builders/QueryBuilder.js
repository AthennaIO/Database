/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class QueryBuilder {
  /**
   * The drivers responsible for handling database operations.
   *
   * @type {any}
   */
  #driver = null

  /**
   * Creates a new instance of QueryBuilder.
   *
   * @param {any} driver
   * @param {string} tableName
   * @return {QueryBuilder}
   */
  constructor(driver, tableName) {
    this.#driver = driver
    this.#driver.table(tableName)
  }

  /**
   * Return the client of driver.
   *
   * @return {import('knex').Knex}
   */
  getClient() {
    return this.#driver.getClient()
  }

  /**
   * Return the query builder of driver.
   *
   * @return {import('knex').Knex.QueryBuilder}
   */
  getQueryBuilder() {
    return this.#driver.getQueryBuilder()
  }

  /**
   * Calculate the average of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async avg(column) {
    return this.#driver.avg(column)
  }

  /**
   * Calculate the average of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async avgDistinct(column) {
    return this.#driver.avgDistinct(column)
  }

  /**
   * Get the max number of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async max(column) {
    return this.#driver.max(column)
  }

  /**
   * Get the min number of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async min(column) {
    return this.#driver.min(column)
  }

  /**
   * Sum all numbers of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async sum(column) {
    return this.#driver.sum(column)
  }

  /**
   * Sum all numbers of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async sumDistinct(column) {
    return this.#driver.sumDistinct(column)
  }

  /**
   * Increment a value of a given column.
   *
   * @param {string} column
   * @return {Promise<number | number[]>}
   */
  async increment(column) {
    return this.#driver.increment(column)
  }

  /**
   * Decrement a value of a given column.
   *
   * @param {string} column
   * @return {Promise<number | number[]>}
   */
  async decrement(column) {
    return this.#driver.decrement(column)
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async count(column = '*') {
    return this.#driver.count(column)
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async countDistinct(column) {
    return this.#driver.countDistinct(column)
  }

  /**
   * Find a value in database or throw exception if undefined.
   *
   * @return {Promise<any>}
   */
  async findOrFail() {
    return this.#driver.findOrFail()
  }

  /**
   * Find a value in database.
   *
   * @return {Promise<any>}
   */
  async find() {
    return this.#driver.find()
  }

  /**
   * Find many values in database.
   *
   * @return {Promise<any[]>}
   */
  async findMany() {
    return this.#driver.findMany()
  }

  /**
   * Find many values in database and return as a Collection.
   *
   * @return {Promise<Collection>}
   */
  async collection() {
    return this.#driver.collection()
  }

  /**
   * Find many values in database and return as paginated response.
   *
   * @param [page] {boolean}
   * @param [limit] {boolean}
   * @param [resourceUrl] {string}
   * @return {Promise<import('@athenna/common').PaginatedResponse>}
   */
  async paginate(page = 0, limit = 10, resourceUrl = '/') {
    return this.#driver.paginate(page, limit, resourceUrl)
  }

  /**
   * Create a value in database.
   *
   * @param {any} data
   * @param {string} [primaryKey]
   * @return {Promise<any>}
   */
  async create(data, primaryKey) {
    return this.#driver.create(data, primaryKey)
  }

  /**
   * Create many values in database.
   *
   * @param {any[]} data
   * @param {string} [primaryKey]
   * @return {Promise<any[]>}
   */
  async createMany(data, primaryKey) {
    return this.#driver.createMany(data, primaryKey)
  }

  /**
   * Create data or update if already exists.
   *
   * @param {any | any[]} data
   * @param {string} [primaryKey]
   * @return {Promise<any | any[]>}
   */
  async createOrUpdate(data, primaryKey) {
    return this.#driver.createOrUpdate(data, primaryKey)
  }

  /**
   * Update a value in database.
   *
   * @param {any} data
   * @param {boolean} [force]
   * @return {Promise<any | any[]>}
   */
  async update(data, force = false) {
    return this.#driver.update(data)
  }

  /**
   * Delete one value in database.
   *
   * @return {Promise<any|any[]|void>}
   */
  async delete() {
    return this.#driver.delete()
  }

  /**
   * Executes the given closure when the first argument is true.
   *
   * @param criteria {any}
   * @param callback {(query: QueryBuilder, criteriaValue: any) => void}
   */
  when(criteria, callback) {
    this.#driver.when(criteria, callback)

    return this
  }

  /**
   * Log in console the actual query built.
   *
   * @return {QueryBuilder}
   */
  dump() {
    this.#driver.dump()

    return this
  }

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {QueryBuilder}
   */
  select(...columns) {
    this.#driver.select(...columns)

    return this
  }

  /**
   * Set a join statement in your query.
   *
   * @param tableName {string}
   * @param column1 {string}
   * @param [operation] {string}
   * @param column2 {string}
   * @param joinType {string}
   * @return {QueryBuilder}
   */
  join(tableName, column1, operation = '=', column2, joinType = 'join') {
    this.#driver.join(tableName, column1, operation, column2, joinType)

    return this
  }

  /**
   * Set a join raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {QueryBuilder}
   */
  joinRaw(sql, bindings) {
    this.#driver.joinRaw(sql, bindings)

    return this
  }

  /**
   * Set a group by statement in your query.
   *
   * @param columns {string}
   * @return {QueryBuilder}
   */
  groupBy(...columns) {
    this.#driver.groupBy(...columns)

    return this
  }

  /**
   * Set a group by raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {QueryBuilder}
   */
  groupByRaw(sql, bindings) {
    this.#driver.groupByRaw(sql, bindings)

    return this
  }

  /**
   * Set a having statement in your query.
   *
   * @param column {string}
   * @param [operation] {string|any}
   * @param [value] {any}
   * @return {QueryBuilder}
   */
  having(column, operation, value) {
    this.#driver.having(column, operation, value)

    return this
  }

  /**
   * Set a having raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {QueryBuilder}
   */
  havingRaw(sql, bindings) {
    this.#driver.havingRaw(sql, bindings)

    return this
  }

  /**
   * Set a having exists statement in your query.
   *
   * @param builder {QueryBuilder}
   * @return {QueryBuilder}
   */
  havingExists(builder) {
    this.#driver.havingExists(builder)

    return this
  }

  /**
   * Set a having not exists statement in your query.
   *
   * @param builder {QueryBuilder}
   * @return {QueryBuilder}
   */
  havingNotExists(builder) {
    this.#driver.havingNotExists(builder)

    return this
  }

  /**
   * Set a having in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {QueryBuilder}
   */
  havingIn(columnName, values) {
    this.#driver.havingIn(columnName, values)

    return this
  }

  /**
   * Set a having not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {QueryBuilder}
   */
  havingNotIn(columnName, values) {
    this.#driver.havingNotIn(columnName, values)

    return this
  }

  /**
   * Set a having between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {QueryBuilder}
   */
  havingBetween(columnName, values) {
    this.#driver.havingBetween(columnName, values)

    return this
  }

  /**
   * Set a having not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {QueryBuilder}
   */
  havingNotBetween(columnName, values) {
    this.#driver.havingNotBetween(columnName, values)

    return this
  }

  /**
   * Set a having null statement in your query.
   *
   * @param columnName {string}
   * @return {QueryBuilder}
   */
  havingNull(columnName) {
    this.#driver.havingNull(columnName)

    return this
  }

  /**
   * Set a having not null statement in your query.
   *
   * @param columnName {string}
   * @return {QueryBuilder}
   */
  havingNotNull(columnName) {
    this.#driver.havingNotNull(columnName)

    return this
  }

  /**
   * Set an or having statement in your query.
   *
   * @param column {string}
   * @param [operation] {string|any}
   * @param [value] {any}
   * @return {QueryBuilder}
   */
  orHaving(column, operation, value) {
    this.#driver.orHaving(column, operation, value)

    return this
  }

  /**
   * Set an or having raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {QueryBuilder}
   */
  orHavingRaw(sql, bindings) {
    this.#driver.orHavingRaw(sql, bindings)

    return this
  }

  /**
   * Set an or having exists statement in your query.
   *
   * @param builder {QueryBuilder}
   * @return {QueryBuilder}
   */
  orHavingExists(builder) {
    this.#driver.orHavingExists(builder)

    return this
  }

  /**
   * Set an or having not exists statement in your query.
   *
   * @param builder {QueryBuilder}
   * @return {QueryBuilder}
   */
  orHavingNotExists(builder) {
    this.#driver.orHavingNotExists(builder)

    return this
  }

  /**
   * Set an or having in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {QueryBuilder}
   */
  orHavingIn(columnName, values) {
    this.#driver.orHavingIn(columnName, values)

    return this
  }

  /**
   * Set an or having not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {QueryBuilder}
   */
  orHavingNotIn(columnName, values) {
    this.#driver.orHavingNotIn(columnName, values)

    return this
  }

  /**
   * Set an or having between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {QueryBuilder}
   */
  orHavingBetween(columnName, values) {
    this.#driver.orHavingBetween(columnName, values)

    return this
  }

  /**
   * Set an or having not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {QueryBuilder}
   */
  orHavingNotBetween(columnName, values) {
    this.#driver.orHavingNotBetween(columnName, values)

    return this
  }

  /**
   * Set an or having null statement in your query.
   *
   * @param columnName {string}
   * @return {QueryBuilder}
   */
  orHavingNull(columnName) {
    this.#driver.orHavingNull(columnName)

    return this
  }

  /**
   * Set an or having not null statement in your query.
   *
   * @param columnName {string}
   * @return {QueryBuilder}
   */
  orHavingNotNull(columnName) {
    this.#driver.orHavingNotNull(columnName)

    return this
  }

  /**
   * Set a where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [operation] {string|Record<string, any>}
   * @param [value] {Record<string, any>}
   * @return {QueryBuilder}
   */
  where(statement, operation, value) {
    this.#driver.where(statement, operation, value)

    return this
  }

  /**
   * Set a where not statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {QueryBuilder}
   */
  whereNot(statement, value) {
    this.#driver.whereNot(statement, value)

    return this
  }

  /**
   * Set a where raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {QueryBuilder}
   */
  whereRaw(sql, bindings) {
    this.#driver.whereRaw(sql, bindings)

    return this
  }

  /**
   * Set a where exists statement in your query.
   *
   * @param builder {QueryBuilder}
   * @return {QueryBuilder}
   */
  whereExists(builder) {
    this.#driver.whereExists(builder)

    return this
  }

  /**
   * Set a where not exists statement in your query.
   *
   * @param builder {QueryBuilder}
   * @return {QueryBuilder}
   */
  whereNotExists(builder) {
    this.#driver.whereNotExists(builder)

    return this
  }

  /**
   * Set a where like statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {QueryBuilder}
   */
  whereLike(statement, value) {
    this.#driver.whereLike(statement, value)

    return this
  }

  /**
   * Set a where ILike statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {QueryBuilder}
   */
  whereILike(statement, value) {
    this.#driver.whereILike(statement, value)

    return this
  }

  /**
   * Set a where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {QueryBuilder}
   */
  whereIn(columnName, values) {
    this.#driver.whereIn(columnName, values)

    return this
  }

  /**
   * Set a where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {QueryBuilder}
   */
  whereNotIn(columnName, values) {
    this.#driver.whereNotIn(columnName, values)

    return this
  }

  /**
   * Set a where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {QueryBuilder}
   */
  whereBetween(columnName, values) {
    this.#driver.whereBetween(columnName, values)

    return this
  }

  /**
   * Set a where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {QueryBuilder}
   */
  whereNotBetween(columnName, values) {
    this.#driver.whereNotBetween(columnName, values)

    return this
  }

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {QueryBuilder}
   */
  whereNull(columnName) {
    this.#driver.whereNull(columnName)

    return this
  }

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {QueryBuilder}
   */
  whereNotNull(columnName) {
    this.#driver.whereNotNull(columnName)

    return this
  }

  /**
   * Set a or where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [operation] {string|Record<string, any>}
   * @param [value] {Record<string, any>}
   * @return {QueryBuilder}
   */
  orWhere(statement, operation, value) {
    this.#driver.orWhere(statement, operation, value)

    return this
  }

  /**
   * Set an or where not statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {QueryBuilder}
   */
  orWhereNot(statement, value) {
    this.#driver.orWhereNot(statement, value)

    return this
  }

  /**
   * Set a or where raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {QueryBuilder}
   */
  orWhereRaw(sql, bindings) {
    this.#driver.orWhereRaw(sql, bindings)

    return this
  }

  /**
   * Set an or where exists statement in your query.
   *
   * @param builder {QueryBuilder}
   * @return {QueryBuilder}
   */
  orWhereExists(builder) {
    this.#driver.orWhereExists(builder)

    return this
  }

  /**
   * Set an or where not exists statement in your query.
   *
   * @param builder {QueryBuilder}
   * @return {QueryBuilder}
   */
  orWhereNotExists(builder) {
    this.#driver.orWhereNotExists(builder)

    return this
  }

  /**
   * Set an or where like statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {QueryBuilder}
   */
  orWhereLike(statement, value) {
    this.#driver.orWhereLike(statement, value)

    return this
  }

  /**
   * Set an or where ILike statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {QueryBuilder}
   */
  orWhereILike(statement, value) {
    this.#driver.orWhereILike(statement, value)

    return this
  }

  /**
   * Set an or where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {QueryBuilder}
   */
  orWhereIn(columnName, values) {
    this.#driver.orWhereIn(columnName, values)

    return this
  }

  /**
   * Set an or where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {QueryBuilder}
   */
  orWhereNotIn(columnName, values) {
    this.#driver.orWhereNotIn(columnName, values)

    return this
  }

  /**
   * Set an or where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {QueryBuilder}
   */
  orWhereBetween(columnName, values) {
    this.#driver.orWhereBetween(columnName, values)

    return this
  }

  /**
   * Set an or where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {QueryBuilder}
   */
  orWhereNotBetween(columnName, values) {
    this.#driver.orWhereNotBetween(columnName, values)

    return this
  }

  /**
   * Set an or where null statement in your query.
   *
   * @param columnName {string}
   * @return {QueryBuilder}
   */
  orWhereNull(columnName) {
    this.#driver.orWhereNull(columnName)

    return this
  }

  /**
   * Set an or where not null statement in your query.
   *
   * @param columnName {string}
   * @return {QueryBuilder}
   */
  orWhereNotNull(columnName) {
    this.#driver.orWhereNotNull(columnName)

    return this
  }

  /**
   * Set an order by statement in your query.
   *
   * @param columnName {string}
   * @param [direction] {'asc'|'desc'|'ASC'|'DESC'}
   * @return {QueryBuilder}
   */
  orderBy(columnName, direction = 'ASC') {
    this.#driver.orderBy(columnName, direction.toUpperCase())

    return this
  }

  /**
   * Set an order by raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {QueryBuilder}
   */
  orderByRaw(sql, bindings) {
    this.#driver.orderByRaw(sql, bindings)

    return this
  }

  /**
   * Order the results easily by the latest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   *
   * @param [columnName] {string}
   * @return {QueryBuilder}
   */
  latest(columnName = 'createdAt') {
    this.#driver.latest(columnName)

    return this
  }

  /**
   * Order the results easily by the oldest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   *
   * @param [columnName] {string}
   * @return {QueryBuilder}
   */
  oldest(columnName = 'createdAt') {
    this.#driver.oldest(columnName)

    return this
  }

  /**
   * Set the skip number in your query.
   *
   * @param number {number}
   * @return {QueryBuilder}
   */
  offset(number) {
    this.#driver.offset(number)

    return this
  }

  /**
   * Set the limit number in your query.
   *
   * @param number {number}
   * @return {QueryBuilder}
   */
  limit(number) {
    this.#driver.limit(number)

    return this
  }
}
