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
    this.#driver.buildTable(tableName)
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
   * @return {Promise<import('@secjs/utils').PaginatedResponse>}
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
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {QueryBuilder}
   */
  buildSelect(...columns) {
    this.#driver.buildSelect(...columns)

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
  buildJoin(tableName, column1, operation = '=', column2, joinType = 'join') {
    this.#driver.buildJoin(tableName, column1, operation, column2, joinType)

    return this
  }

  /**
   * Set a group by statement in your query.
   *
   * @param columns {string}
   * @return {QueryBuilder}
   */
  buildGroupBy(...columns) {
    this.#driver.buildGroupBy(...columns)

    return this
  }

  /**
   * Set a where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [operation] {string}
   * @param [value] {any}
   * @return {QueryBuilder}
   */
  buildWhere(statement, operation, value) {
    this.#driver.buildWhere(statement, operation, value)

    return this
  }

  /**
   * Set a or where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [operation] {string}
   * @param [value] {any}
   * @return {QueryBuilder}
   */
  buildOrWhere(statement, operation, value) {
    this.#driver.buildOrWhere(statement, operation, value)

    return this
  }

  /**
   * Set a where not statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {QueryBuilder}
   */
  buildWhereNot(statement, value) {
    this.#driver.buildWhereNot(statement, value)

    return this
  }

  /**
   * Set a where like statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {QueryBuilder}
   */
  buildWhereLike(statement, value) {
    this.#driver.buildWhereLike(statement, value)

    return this
  }

  /**
   * Set a where ILike statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {QueryBuilder}
   */
  buildWhereILike(statement, value) {
    this.#driver.buildWhereILike(statement, value)

    return this
  }

  /**
   * Set a where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {QueryBuilder}
   */
  buildWhereIn(columnName, values) {
    this.#driver.buildWhereIn(columnName, values)

    return this
  }

  /**
   * Set a where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {QueryBuilder}
   */
  buildWhereNotIn(columnName, values) {
    this.#driver.buildWhereNotIn(columnName, values)

    return this
  }

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {QueryBuilder}
   */
  buildWhereNull(columnName) {
    this.#driver.buildWhereNull(columnName)

    return this
  }

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {QueryBuilder}
   */
  buildWhereNotNull(columnName) {
    this.#driver.buildWhereNotNull(columnName)

    return this
  }

  /**
   * Set a where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {QueryBuilder}
   */
  buildWhereBetween(columnName, values) {
    this.#driver.buildWhereBetween(columnName, values)

    return this
  }

  /**
   * Set a where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {QueryBuilder}
   */
  buildWhereNotBetween(columnName, values) {
    this.#driver.buildWhereNotBetween(columnName, values)

    return this
  }

  /**
   * Set a order by statement in your query.
   *
   * @param columnName {string}
   * @param [direction] {'asc'|'desc'|'ASC'|'DESC'}
   * @return {QueryBuilder}
   */
  buildOrderBy(columnName, direction = 'ASC') {
    this.#driver.buildOrderBy(columnName, direction)

    return this
  }

  /**
   * Set the skip number in your query.
   *
   * @param number {number}
   * @return {QueryBuilder}
   */
  buildOffset(number) {
    this.#driver.buildOffset(number)

    return this
  }

  /**
   * Set the limit number in your query.
   *
   * @param number {number}
   * @return {QueryBuilder}
   */
  buildLimit(number) {
    this.#driver.buildLimit(number)

    return this
  }
}
