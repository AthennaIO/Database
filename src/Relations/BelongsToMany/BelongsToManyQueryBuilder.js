/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ModelQueryBuilder } from '#src/Models/ModelQueryBuilder'
import { Database } from '#src/index'

export class BelongsToManyQueryBuilder {
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
   * Get the pivot table data.
   *
   * @return {Promise<any[]>}
   */
  async getPivotTable() {
    return Database.connection(this.#options.connection)
      .table(this.#options.pivotTable)
      .where(
        this.#options.pivotLocalForeign,
        this.#fatherModel[this.#options.pivotLocalPrimary],
      )
      .findMany()
  }

  /**
   * Get the pivot table relation ids.
   *
   * @return {Promise<any[]>}
   */
  async getPivotTablesRelationIds() {
    const pivotTableData = await this.getPivotTable()

    return pivotTableData.map(d => d[this.#options.pivotRelationForeign])
  }

  /**
   * Calculate the average of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async avg(column) {
    const relationIds = await this.getPivotTablesRelationIds()

    return this.#ModelQB
      .whereIn(this.#options.pivotRelationPrimary, relationIds)
      .avg(column)
  }

  /**
   * Calculate the average of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async avgDistinct(column) {
    const relationIds = await this.getPivotTablesRelationIds()

    return this.#ModelQB
      .whereIn(this.#options.pivotRelationPrimary, relationIds)
      .avgDistinct(column)
  }

  /**
   * Get the max number of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async max(column) {
    const relationIds = await this.getPivotTablesRelationIds()

    return this.#ModelQB
      .whereIn(this.#options.pivotRelationPrimary, relationIds)
      .max(column)
  }

  /**
   * Get the min number of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async min(column) {
    const relationIds = await this.getPivotTablesRelationIds()

    return this.#ModelQB
      .whereIn(this.#options.pivotRelationPrimary, relationIds)
      .min(column)
  }

  /**
   * Sum all numbers of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async sum(column) {
    const relationIds = await this.getPivotTablesRelationIds()

    return this.#ModelQB
      .whereIn(this.#options.pivotRelationPrimary, relationIds)
      .sum(column)
  }

  /**
   * Sum all numbers of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async sumDistinct(column) {
    const relationIds = await this.getPivotTablesRelationIds()

    return this.#ModelQB
      .whereIn(this.#options.pivotRelationPrimary, relationIds)
      .sumDistinct(column)
  }

  /**
   * Increment a value of a given column.
   *
   * @param {string} column
   * @return {Promise<number | number[]>}
   */
  async increment(column) {
    const relationIds = await this.getPivotTablesRelationIds()

    return this.#ModelQB
      .whereIn(this.#options.pivotRelationPrimary, relationIds)
      .increment(column)
  }

  /**
   * Decrement a value of a given column.
   *
   * @param {string} column
   * @return {Promise<number | number[]>}
   */
  async decrement(column) {
    const relationIds = await this.getPivotTablesRelationIds()

    return this.#ModelQB
      .whereIn(this.#options.pivotRelationPrimary, relationIds)
      .decrement(column)
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async count(column = '*') {
    const relationIds = await this.getPivotTablesRelationIds()

    return this.#ModelQB
      .whereIn(this.#options.pivotRelationPrimary, relationIds)
      .count(column)
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async countDistinct(column) {
    const relationIds = await this.getPivotTablesRelationIds()

    return this.#ModelQB
      .whereIn(this.#options.pivotRelationPrimary, relationIds)
      .countDistinct(column)
  }

  /**
   * Find one data in database or throw exception if undefined.
   *
   * @return {Promise<import('#src/index').Model>}
   */
  async findOrFail() {
    const relationIds = await this.getPivotTablesRelationIds()

    return this.#ModelQB
      .whereIn(this.#options.pivotRelationPrimary, relationIds)
      .findOrFail()
  }

  /**
   * Return a single model instance or, if no results are found,
   * execute the given closure.
   *
   * @return {Promise<import('#src/index').Model | any>}
   */
  async findOr(callback) {
    const relationIds = await this.getPivotTablesRelationIds()

    return this.#ModelQB
      .whereIn(this.#options.pivotRelationPrimary, relationIds)
      .findOr(callback)
  }

  /**
   * Find one data in database.
   *
   * @return {Promise<import('#src/index').Model>}
   */
  async find() {
    const relationIds = await this.getPivotTablesRelationIds()

    return this.#ModelQB
      .whereIn(this.#options.pivotRelationPrimary, relationIds)
      .find()
  }

  /**
   * Find many data in database.
   *
   * @return {Promise<import('#src/index').Model[]>}
   */
  async findMany() {
    const relationIds = await this.getPivotTablesRelationIds()

    return this.#ModelQB
      .whereIn(this.#options.pivotRelationPrimary, relationIds)
      .findMany()
  }

  /**
   * Find many data in database and return as a Collection.
   *
   * @return {Promise<Collection<import('#src/index').Model>>}
   */
  async collection() {
    const relationIds = await this.getPivotTablesRelationIds()

    return this.#ModelQB
      .whereIn(this.#options.pivotRelationPrimary, relationIds)
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
    const relationIds = await this.getPivotTablesRelationIds()

    return this.#ModelQB
      .whereIn(this.#options.pivotRelationPrimary, relationIds)
      .paginate(page, limit, resourceUrl)
  }

  /**
   * Attach a model to another by inserting a record in the pivot
   * table.
   *
   * @return {Promise<void>}
   */
  async attach(id, additionalColumns = {}) {
    await Database.connection(this.#options.connection)
      .table(this.#options.pivotTable)
      .create({
        [this.#options.pivotLocalForeign]:
          this.#fatherModel[this.#options.pivotLocalPrimary],
        [this.#options.pivotRelationForeign]: id,
        ...additionalColumns,
      })
  }

  /**
   * Delete the appropriate record out of the pivot table; however,
   * both models will remain in the database.
   */
  async detach(id) {
    if (!id) {
      await Database.connection(this.#options.connection)
        .table(this.#options.pivotTable)
        .where(
          this.#options.pivotLocalForeign,
          this.#fatherModel[this.#options.pivotLocalPrimary],
        )
        .delete()

      return
    }

    await Database.connection(this.#options.connection)
      .table(this.#options.pivotTable)
      .where(
        this.#options.pivotLocalForeign,
        this.#fatherModel[this.#options.pivotLocalPrimary],
      )
      .where(this.#options.pivotRelationForeign, id)
      .delete()
  }

  /**
   * Create one model in database.
   *
   * @param data {any}
   * @param {boolean} ignorePersistOnly
   * @return {Promise<import('#src/index').Model>}
   */
  async create(data, ignorePersistOnly = false) {
    const model = await this.#ModelQB.create(data, ignorePersistOnly)

    await Database.connection(this.#options.connection)
      .table(this.#options.pivotTable)
      .create({
        [this.#options.pivotLocalForeign]:
          this.#fatherModel[this.#options.pivotLocalPrimary],
        [this.#options.pivotRelationForeign]:
          model[this.#options.pivotRelationPrimary],
      })

    return model
  }

  /**
   * Create many models in database.
   *
   * @param data {any}
   * @param {boolean} ignorePersistOnly
   * @return {Promise<import('#src/index').Model[]>}
   */
  async createMany(data, ignorePersistOnly = false) {
    const models = await this.#ModelQB.createMany(data, ignorePersistOnly)

    const pivotDatas = models.map(model => ({
      [this.#options.pivotLocalForeign]:
        this.#fatherModel[this.#options.pivotLocalPrimary],
      [this.#options.pivotRelationForeign]:
        model[this.#options.pivotRelationPrimary],
    }))

    await Database.connection(this.#options.connection)
      .table(this.#options.pivotTable)
      .createMany(pivotDatas)

    return models
  }

  /**
   * Create or update models in database.
   *
   * @param data {any}
   * @param {boolean} ignorePersistOnly
   * @return {Promise<import('#src/index').Model | import('#src/index').Model[]>}
   */
  async createOrUpdate(data, ignorePersistOnly = false) {
    const model = await this.#ModelQB.createOrUpdate(data, ignorePersistOnly)

    await Database.connection(this.#options.connection)
      .table(this.#options.pivotTable)
      .where({
        [this.#options.pivotLocalForeign]:
          this.#fatherModel[this.#options.pivotLocalPrimary],
        [this.#options.pivotRelationForeign]:
          model[this.#options.pivotRelationPrimary],
      })
      .createOrUpdate({
        [this.#options.pivotLocalForeign]:
          this.#fatherModel[this.#options.pivotLocalPrimary],
        [this.#options.pivotRelationForeign]:
          model[this.#options.pivotRelationPrimary],
      })

    return model
  }

  /**
   * Update one or more models in database.
   *
   * @param data {any}
   * @param {boolean} ignorePersistOnly
   * @return {Promise<import('#src/index').Model | import('#src/index').Model[]>}
   */
  async update(data, ignorePersistOnly = false) {
    const relationIds = await this.getPivotTablesRelationIds()

    return this.#ModelQB
      .whereIn(this.#options.pivotRelationPrimary, relationIds)
      .update(data, ignorePersistOnly)
  }

  /**
   * Delete one or more models in database.
   *
   * @param [force] {boolean}
   * @return {Promise<import('#src/index').Model | import('#src/index').Model[] | void>}
   */
  async delete(force = false) {
    const relationIds = await this.getPivotTablesRelationIds()

    const models = await this.whereIn(
      this.#options.pivotRelationPrimary,
      relationIds,
    ).findMany()
    const modelsIds = models.map(m => m[this.#options.pivotRelationPrimary])

    await Database.connection(this.#options.connection)
      .table(this.#options.pivotTable)
      .where(
        this.#options.pivotLocalForeign,
        this.#fatherModel[this.#options.pivotLocalPrimary],
      )
      .whereIn(this.#options.pivotRelationForeign, modelsIds)
      .delete()

    return this.#ModelQB
      .whereIn(this.#options.pivotRelationPrimary, modelsIds)
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
   * @return {BelongsToManyQueryBuilder}
   */
  withTrashed() {
    this.#ModelQB.withTrashed()

    return this
  }

  /**
   * Get only the soft deleted values from database.
   *
   * @return {BelongsToManyQueryBuilder}
   */
  onlyTrashed() {
    this.#ModelQB.onlyTrashed()

    return this
  }

  /**
   * Remove the criteria from query builder by name.
   *
   * @param name {string}
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
   */
  dump() {
    this.#ModelQB.dump()

    return this
  }

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
   */
  oldest(columnName) {
    this.#ModelQB.oldest(columnName)

    return this
  }

  /**
   * Set the group by in your query.
   *
   * @param columns {string}
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
   */
  having(column, operation, value) {
    this.#ModelQB.having(column, operation, value)

    return this
  }

  /**
   * Set a having exists statement in your query.
   *
   * @param clause {any}
   * @return {BelongsToManyQueryBuilder}
   */
  havingExists(clause) {
    this.#ModelQB.havingExists(clause)

    return this
  }

  /**
   * Set a having not exists statement in your query.
   *
   * @param clause {any}
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
   */
  havingNotBetween(columnName, values) {
    this.#ModelQB.havingNotBetween(columnName, values)

    return this
  }

  /**
   * Set a having null statement in your query.
   *
   * @param columnName {string}
   * @return {BelongsToManyQueryBuilder}
   */
  havingNull(columnName) {
    this.#ModelQB.havingNull(columnName)

    return this
  }

  /**
   * Set a having not null statement in your query.
   *
   * @param columnName {string}
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
   */
  orHaving(column, operation, value) {
    this.#ModelQB.orHaving(column, operation, value)

    return this
  }

  /**
   * Set an or having exists statement in your query.
   *
   * @param clause {any}
   * @return {BelongsToManyQueryBuilder}
   */
  orHavingExists(clause) {
    this.#ModelQB.orHavingExists(clause)

    return this
  }

  /**
   * Set an or having not exists statement in your query.
   *
   * @param clause {any}
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
   */
  orHavingNotBetween(columnName, values) {
    this.#ModelQB.orHavingNotBetween(columnName, values)

    return this
  }

  /**
   * Set an or having null statement in your query.
   *
   * @param columnName {string}
   * @return {BelongsToManyQueryBuilder}
   */
  orHavingNull(columnName) {
    this.#ModelQB.orHavingNull(columnName)

    return this
  }

  /**
   * Set an or having not null statement in your query.
   *
   * @param columnName {string}
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
   */
  whereNot(statement, value) {
    this.#ModelQB.whereNot(statement, value)

    return this
  }

  /**
   * Set a where exists statement in your query.
   *
   * @param clause {any}
   * @return {BelongsToManyQueryBuilder}
   */
  whereExists(clause) {
    this.#ModelQB.whereExists(clause)

    return this
  }

  /**
   * Set a where not exists statement in your query.
   *
   * @param clause {any}
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
   */
  whereNotBetween(columnName, values) {
    this.#ModelQB.whereNotBetween(columnName, values)

    return this
  }

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {BelongsToManyQueryBuilder}
   */
  whereNull(columnName) {
    this.#ModelQB.whereNull(columnName)

    return this
  }

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
   */
  orWhereNot(statement, value) {
    this.#ModelQB.orWhereNot(statement, value)

    return this
  }

  /**
   * Set an or where exists statement in your query.
   *
   * @param clause {any}
   * @return {BelongsToManyQueryBuilder}
   */
  orWhereExists(clause) {
    this.#ModelQB.orWhereExists(clause)

    return this
  }

  /**
   * Set an or where not exists statement in your query.
   *
   * @param clause {any}
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
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
   * @return {BelongsToManyQueryBuilder}
   */
  orWhereNotBetween(columnName, values) {
    this.#ModelQB.orWhereNotBetween(columnName, values)

    return this
  }

  /**
   * Set an or where null statement in your query.
   *
   * @param columnName {string}
   * @return {BelongsToManyQueryBuilder}
   */
  orWhereNull(columnName) {
    this.#ModelQB.orWhereNull(columnName)

    return this
  }

  /**
   * Set an or where not null statement in your query.
   *
   * @param columnName {string}
   * @return {BelongsToManyQueryBuilder}
   */
  orWhereNotNull(columnName) {
    this.#ModelQB.orWhereNotNull(columnName)

    return this
  }

  /**
   * Set how many models should be skipped in your query.
   *
   * @param number {number}
   * @return {BelongsToManyQueryBuilder}
   */
  offset(number) {
    this.#ModelQB.offset(number)

    return this
  }

  /**
   * Set the limit of models in your query.
   *
   * @param number {number}
   * @return {BelongsToManyQueryBuilder}
   */
  limit(number) {
    this.#ModelQB.limit(number)

    return this
  }
}
