/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is, Json, Uuid } from '@athenna/common'

import { Criteria, Database } from '#src/index'
import { ModelGenerator } from '#src/Models/ModelGenerator'
import { NotImplementedRelationException } from '#src/Exceptions/NotImplementedRelationException'

export class ModelQueryBuilder {
  /**
   * The database query builder instance used to handle database operations.
   *
   * @type {import('#src/index').QueryBuilder}
   */
  #QB

  /**
   * The model that is using this instance.
   *
   * @type {typeof import('#src/index').Model}
   */
  #Model

  /**
   * The model schema used to map database operations.
   *
   * @type {import('#src/index').SchemaBuilder}
   */
  #schema

  /**
   * The model generator to create model instances and retrieve relations.
   *
   * @type {import('#src/index').ModelGenerator}
   */
  #generator

  /**
   * Set if this instance of query builder will use criterias or not.
   *
   * @type {boolean}
   */
  #withCriterias

  /**
   * All the criterias of the model.
   *
   * @type {Record<string, Criteria>}
   */
  #criterias

  /**
   * Creates a new instance of ModelQueryBuilder.
   *
   * @param model
   * @param withCriterias
   * @return {ModelQueryBuilder}
   */
  constructor(model, withCriterias) {
    this.#Model = model
    this.#withCriterias = withCriterias
    this.#QB = Database.connection(model.connection).table(model.table)
    this.#schema = this.#Model.getSchema()
    this.#generator = new ModelGenerator(this.#Model, this.#schema)
    this.#criterias = Json.copy(this.#Model.getCriterias())

    if (this.#Model.isSoftDelete) {
      this.#criterias.deletedAt = Criteria.whereNull(
        this.#Model.DELETED_AT,
      ).get()
    }
  }

  /**
   * Return the client of driver.
   *
   * @return {import('knex').Knex}
   */
  getClient() {
    return this.#QB.getClient()
  }

  /**
   * Return the query builder of driver.
   *
   * @return {import('knex').Knex.QueryBuilder}
   */
  getQueryBuilder() {
    return this.#QB.getQueryBuilder()
  }

  /**
   * Calculate the average of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async avg(column) {
    this.#setCriterias()

    return this.#QB.avg(this.#parseNames(column))
  }

  /**
   * Calculate the average of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async avgDistinct(column) {
    this.#setCriterias()

    return this.#QB.avgDistinct(this.#parseNames(column))
  }

  /**
   * Get the max number of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async max(column) {
    this.#setCriterias()

    return this.#QB.max(this.#parseNames(column))
  }

  /**
   * Get the min number of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async min(column) {
    this.#setCriterias()

    return this.#QB.min(this.#parseNames(column))
  }

  /**
   * Sum all numbers of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async sum(column) {
    this.#setCriterias()

    return this.#QB.sum(this.#parseNames(column))
  }

  /**
   * Sum all numbers of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async sumDistinct(column) {
    this.#setCriterias()

    return this.#QB.sumDistinct(this.#parseNames(column))
  }

  /**
   * Increment a value of a given column.
   *
   * @param {string} column
   * @return {Promise<number | number[]>}
   */
  async increment(column) {
    this.#setCriterias()

    return this.#QB.increment(this.#parseNames(column))
  }

  /**
   * Decrement a value of a given column.
   *
   * @param {string} column
   * @return {Promise<number | number[]>}
   */
  async decrement(column) {
    this.#setCriterias()

    return this.#QB.decrement(this.#parseNames(column))
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async count(column = '*') {
    this.#setCriterias()

    return this.#QB.count(column === '*' ? column : this.#parseNames(column))
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async countDistinct(column) {
    return this.#QB.countDistinct(this.#parseNames(column))
  }

  /**
   * Find one data in database or throw exception if undefined.
   *
   * @return {Promise<any>}
   */
  async findOrFail() {
    this.#setCriterias()

    return this.#generator.generateOne(await this.#QB.findOrFail())
  }

  /**
   * Return a single model instance or, if no results are found,
   * execute the given closure.
   *
   * @return {Promise<any>}
   */
  async findOr(callback) {
    this.#setCriterias()

    const data = await this.#QB.find()

    if (data) {
      return this.#generator.generateOne(data)
    }

    return callback()
  }

  /**
   * Find one data in database.
   *
   * @return {Promise<any>}
   */
  async find() {
    this.#setCriterias()

    return this.#generator.generateOne(await this.#QB.find())
  }

  /**
   * Find many data in database.
   *
   * @return {Promise<any[]>}
   */
  async findMany() {
    this.#setCriterias()

    return this.#generator.generateMany(await this.#QB.findMany())
  }

  /**
   * Find many data in database and return as a Collection.
   *
   * @return {Promise<Collection>}
   */
  async collection() {
    this.#setCriterias()

    /**
     * Creating the first collection with flat data.
     */
    const firstCollection = await this.#QB.collection()

    /**
     * The second collection instance with all data parsed.
     */
    const collection = firstCollection.map(i => this.#generator.generateOne(i))

    /**
     * Await the resolution of all items in the collection
     * until return.
     */
    collection.items = await Promise.all(collection.items)

    return collection
  }

  /**
   * Find many models in database and return as paginated response.
   *
   * @param [page] {boolean}
   * @param [limit] {boolean}
   * @param [resourceUrl] {string}
   * @return {Promise<{
   *   data: InstanceType<this>[],
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
    this.#setCriterias()

    const { data, meta, links } = await this.#QB.paginate(
      page,
      limit,
      resourceUrl,
    )

    return { data: await this.#generator.generateMany(data), meta, links }
  }

  /**
   * Create one model in database.
   *
   * @param data {any}
   * @param {boolean} ignorePersistOnly
   * @return {Promise<any>}
   */
  async create(data, ignorePersistOnly = false) {
    if (!ignorePersistOnly) {
      data = this.#fillable(data)
    }

    const primaryKey = this.#Model.primaryKey

    if (!data[primaryKey]) {
      const column = this.#schema.columns.find(
        column => column.name === primaryKey,
      )

      if (column.type === 'uuid') {
        data[primaryKey] = Uuid.generate()
      }
    }

    const attributes = this.#Model.attributes

    Object.keys(attributes).forEach(key => {
      if (data[key]) {
        return
      }

      data[key] = attributes[key]
    })

    if (this.#schema.hasTimestamp()) {
      const date = new Date()

      data[this.#schema.getCreatedAt()] =
        data[this.#schema.getCreatedAt()] || date

      data[this.#schema.getUpdatedAt()] =
        data[this.#schema.getUpdatedAt()] || date
    }

    return this.#generator.generateOne(await this.#QB.create(data))
  }

  /**
   * Create many models in database.
   *
   * @param data {any}
   * @param {boolean} ignorePersistOnly
   * @return {Promise<any[]>}
   */
  async createMany(data, ignorePersistOnly = false) {
    if (!ignorePersistOnly) {
      data = this.#fillable(data)
    }

    const executor = data => {
      const attributes = this.#Model.attributes

      Object.keys(attributes).forEach(key => {
        if (data[key]) {
          return
        }

        data[key] = attributes[key]
      })

      if (this.#schema.hasTimestamp()) {
        const date = new Date()

        data[this.#schema.getCreatedAt()] =
          data[this.#schema.getCreatedAt()] || date

        data[this.#schema.getUpdatedAt()] =
          data[this.#schema.getUpdatedAt()] || date
      }

      return data
    }

    return this.#generator.generateMany(
      await this.#QB.createMany(data.map(executor)),
    )
  }

  /**
   * Create or update models in database.
   *
   * @param data {any}
   * @param {boolean} ignorePersistOnly
   * @return {Promise<any | any[]>}
   */
  async createOrUpdate(data, ignorePersistOnly = false) {
    if (!ignorePersistOnly) {
      data = this.#fillable(data)
    }

    const attributes = this.#Model.attributes

    Object.keys(attributes).forEach(key => {
      if (data[key]) {
        return
      }

      data[key] = attributes[key]
    })

    const hasValue = await this.#QB.find()
    const primaryKey = this.#Model.primaryKey

    if (hasValue) {
      return this.where(primaryKey, hasValue[primaryKey]).update(
        data,
        ignorePersistOnly,
      )
    }

    return this.create(data, ignorePersistOnly)
  }

  /**
   * Update one or more models in database.
   *
   * @param data {any}
   * @param {boolean} ignorePersistOnly
   * @return {Promise<any|any[]>}
   */
  async update(data, ignorePersistOnly = false) {
    if (!ignorePersistOnly) {
      data = this.#fillable(data)
    }

    if (this.#schema.hasUpdatedAt()) {
      data[this.#schema.getUpdatedAt()] =
        data[this.#schema.getUpdatedAt()] || new Date()
    }

    const result = await this.#QB.update(data)

    if (Is.Array(result)) {
      return this.#generator.generateMany(result)
    }

    return this.#generator.generateOne(result)
  }

  /**
   * Delete one or more models in database.
   *
   * @param [force] {boolean}
   * @return {Promise<any|any[]|void>}
   */
  async delete(force = false) {
    if (this.#Model.isSoftDelete && !force) {
      const result = await this.#QB.update({
        [this.#Model.DELETED_AT]: new Date(),
      })

      if (Is.Array(result)) {
        return this.#generator.generateMany(result)
      }

      return this.#generator.generateOne(result)
    }

    await this.#QB.delete()
  }

  /**
   * Restore a soft deleted models from database.
   *
   * @return {Promise<any | any[]>}
   */
  async restore() {
    return this.update({ deletedAt: null }, true)
  }

  /**
   * Get all the records even the soft deleted.
   *
   * @return {ModelQueryBuilder}
   */
  withTrashed() {
    return this.removeCriteria('deletedAt')
  }

  /**
   * Get only the soft deleted values from database.
   *
   * @return {ModelQueryBuilder}
   */
  onlyTrashed() {
    return this.removeCriteria('deletedAt').whereNotNull(this.#Model.DELETED_AT)
  }

  /**
   * Remove the criteria from query builder by name.
   *
   * @param name {string}
   * @return {ModelQueryBuilder}
   */
  removeCriteria(name) {
    if (!this.#criterias[name]) {
      return this
    }

    delete this.#criterias[name]

    return this
  }

  /**
   * Executes the given closure when the first argument is true.
   *
   * @param criteria {any}
   * @param callback {(query: ModelQueryBuilder, criteriaValue: any) => void}
   */
  when(criteria, callback) {
    if (!criteria) {
      return this
    }

    // eslint-disable-next-line n/no-callback-literal
    callback(this, criteria)

    return this
  }

  /**
   * Log in console the actual query built.
   *
   * @return {ModelQueryBuilder}
   */
  dump() {
    this.#QB.dump()

    return this
  }

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {ModelQueryBuilder}
   */
  select(...columns) {
    if (columns.includes('*')) {
      this.#schema.columns = this.#schema.columns.map(c => {
        c.isHidden = false

        return c
      })
    }

    columns.forEach(column => {
      const index = this.#schema.columns.indexOf(c => c.name === column)

      if (index === -1) {
        return
      }

      this.#schema.columns[index] = {
        ...this.#schema.columns[index],
        isHidden: false,
      }
    })

    columns = this.#schema.getReversedColumnNamesOf(columns)

    this.#QB.select(...this.#parseNames(columns))

    return this
  }

  /**
   * Set the order in your query.
   *
   * @param [columnName] {string}
   * @param [direction] {'asc'|'desc'|'ASC'|'DESC'}
   * @return {ModelQueryBuilder}
   */
  orderBy(columnName = this.#Model.primaryKey, direction = 'ASC') {
    this.#QB.orderBy(this.#parseNames(columnName), direction.toLowerCase())

    return this
  }

  /**
   * Order the results easily by the latest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   *
   * @param [columnName] {string}
   * @return {ModelQueryBuilder}
   */
  latest(columnName = 'createdAt') {
    this.#QB.latest(this.#parseNames(columnName))

    return this
  }

  /**
   * Order the results easily by the oldest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   *
   * @param [columnName] {string}
   * @return {ModelQueryBuilder}
   */
  oldest(columnName = 'createdAt') {
    this.#QB.oldest(this.#parseNames(columnName))

    return this
  }

  /**
   * Set the group by in your query.
   *
   * @param columns {string}
   * @return {ModelQueryBuilder}
   */
  groupBy(...columns) {
    this.#QB.groupBy(...this.#parseNames(columns))

    return this
  }

  /**
   * Set a having statement in your query.
   *
   * @param column {string}
   * @param operation {string}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  having(column, operation, value) {
    this.#QB.having(this.#parseNames(column), operation, value)

    return this
  }

  /**
   * Set a having exists statement in your query.
   *
   * @param clause {any}
   * @return {ModelQueryBuilder}
   */
  havingExists(clause) {
    this.#QB.havingExists(clause)

    return this
  }

  /**
   * Set a having not exists statement in your query.
   *
   * @param clause {any}
   * @return {ModelQueryBuilder}
   */
  havingNotExists(clause) {
    this.#QB.havingNotExists(clause)

    return this
  }

  /**
   * Set a having in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {ModelQueryBuilder}
   */
  havingIn(columnName, values) {
    this.#QB.havingIn(this.#parseNames(columnName), values)

    return this
  }

  /**
   * Set a having not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {ModelQueryBuilder}
   */
  havingNotIn(columnName, values) {
    this.#QB.havingNotIn(this.#parseNames(columnName), values)

    return this
  }

  /**
   * Set a having between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {ModelQueryBuilder}
   */
  havingBetween(columnName, values) {
    this.#QB.havingBetween(this.#parseNames(columnName), values)

    return this
  }

  /**
   * Set a having not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {ModelQueryBuilder}
   */
  havingNotBetween(columnName, values) {
    this.#QB.havingNotBetween(this.#parseNames(columnName), values)

    return this
  }

  /**
   * Set a having null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  havingNull(columnName) {
    this.#QB.havingNull(this.#parseNames(columnName))

    return this
  }

  /**
   * Set a having not null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  havingNotNull(columnName) {
    this.#QB.havingNotNull(this.#parseNames(columnName))

    return this
  }

  /**
   * Set an or having statement in your query.
   *
   * @param column {string}
   * @param operation {string}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  orHaving(column, operation, value) {
    this.#QB.orHaving(this.#parseNames(column), operation, value)

    return this
  }

  /**
   * Set an or having exists statement in your query.
   *
   * @param clause {any}
   * @return {ModelQueryBuilder}
   */
  orHavingExists(clause) {
    this.#QB.orHavingExists(clause)

    return this
  }

  /**
   * Set an or having not exists statement in your query.
   *
   * @param clause {any}
   * @return {ModelQueryBuilder}
   */
  orHavingNotExists(clause) {
    this.#QB.orHavingNotExists(clause)

    return this
  }

  /**
   * Set an or having in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {ModelQueryBuilder}
   */
  orHavingIn(columnName, values) {
    this.#QB.orHavingIn(this.#parseNames(columnName), values)

    return this
  }

  /**
   * Set an or having not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {ModelQueryBuilder}
   */
  orHavingNotIn(columnName, values) {
    this.#QB.orHavingNotIn(this.#parseNames(columnName), values)

    return this
  }

  /**
   * Set an or having between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {ModelQueryBuilder}
   */
  orHavingBetween(columnName, values) {
    this.#QB.orHavingBetween(this.#parseNames(columnName), values)

    return this
  }

  /**
   * Set an or having not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {ModelQueryBuilder}
   */
  orHavingNotBetween(columnName, values) {
    this.#QB.orHavingNotBetween(this.#parseNames(columnName), values)

    return this
  }

  /**
   * Set an or having null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  orHavingNull(columnName) {
    this.#QB.orHavingNull(this.#parseNames(columnName))

    return this
  }

  /**
   * Set an or having not null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  orHavingNotNull(columnName) {
    this.#QB.orHavingNotNull(this.#parseNames(columnName))

    return this
  }

  /**
   * Eager load a relation in your query.
   *
   * @param relationName {string|any}
   * @param [callback] {any}
   * @return {ModelQueryBuilder}
   */
  with(relationName, callback) {
    const relation = this.#schema.getRelationByName(relationName)

    if (!relation) {
      throw new NotImplementedRelationException(
        relationName,
        this.#Model.name,
        this.#schema.getAvailableRelationsString(),
      )
    }

    const index = this.#schema.relations.indexOf(relation)

    relation.isIncluded = true
    relation.callback = callback

    this.#schema.relations[index] = relation

    return this
  }

  /**
   * Set a where statement in your query.
   *
   * @param statement {any}
   * @param [operation] {string}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  where(statement, operation, value) {
    this.#QB.where(this.#parseNames(statement), operation, value)

    return this
  }

  /**
   * Set a where not statement in your query.
   *
   * @param statement {any}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  whereNot(statement, value) {
    this.#QB.whereNot(this.#parseNames(statement), value)

    return this
  }

  /**
   * Set a where exists statement in your query.
   *
   * @param clause {any}
   * @return {ModelQueryBuilder}
   */
  whereExists(clause) {
    this.#QB.whereExists(clause)

    return this
  }

  /**
   * Set a where not exists statement in your query.
   *
   * @param clause {any}
   * @return {ModelQueryBuilder}
   */
  whereNotExists(clause) {
    this.#QB.whereNotExists(clause)

    return this
  }

  /**
   * Set a where like statement in your query.
   *
   * @param statement {any}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  whereLike(statement, value) {
    this.#QB.whereLike(this.#parseNames(statement), value)

    return this
  }

  /**
   * Set a where ILike statement in your query.
   *
   * @param statement {any}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  whereILike(statement, value) {
    this.#QB.whereILike(this.#parseNames(statement), value)

    return this
  }

  /**
   * Set a where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {ModelQueryBuilder}
   */
  whereIn(columnName, values) {
    this.#QB.whereIn(this.#parseNames(columnName), values)

    return this
  }

  /**
   * Set a where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {ModelQueryBuilder}
   */
  whereNotIn(columnName, values) {
    this.#QB.whereNotIn(this.#parseNames(columnName), values)

    return this
  }

  /**
   * Set a where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {ModelQueryBuilder}
   */
  whereBetween(columnName, values) {
    this.#QB.whereBetween(this.#parseNames(columnName), values)

    return this
  }

  /**
   * Set a where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {ModelQueryBuilder}
   */
  whereNotBetween(columnName, values) {
    this.#QB.whereNotBetween(this.#parseNames(columnName), values)

    return this
  }

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  whereNull(columnName) {
    this.#QB.whereNull(this.#parseNames(columnName))

    return this
  }

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  whereNotNull(columnName) {
    this.#QB.whereNotNull(this.#parseNames(columnName))

    return this
  }

  /**
   * Set a or where statement in your query.
   *
   * @param statement {any}
   * @param [operation] {string}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  orWhere(statement, operation, value) {
    this.#QB.orWhere(this.#parseNames(statement), operation, value)

    return this
  }

  /**
   * Set an or where not statement in your query.
   *
   * @param statement {any}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  orWhereNot(statement, value) {
    this.#QB.orWhereNot(this.#parseNames(statement), value)

    return this
  }

  /**
   * Set an or where exists statement in your query.
   *
   * @param clause {any}
   * @return {ModelQueryBuilder}
   */
  orWhereExists(clause) {
    this.#QB.orWhereExists(clause)

    return this
  }

  /**
   * Set an or where not exists statement in your query.
   *
   * @param clause {any}
   * @return {ModelQueryBuilder}
   */
  orWhereNotExists(clause) {
    this.#QB.orWhereNotExists(clause)

    return this
  }

  /**
   * Set an or where like statement in your query.
   *
   * @param statement {any}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  orWhereLike(statement, value) {
    this.#QB.orWhereLike(this.#parseNames(statement), value)

    return this
  }

  /**
   * Set an or where ILike statement in your query.
   *
   * @param statement {any}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  orWhereILike(statement, value) {
    this.#QB.orWhereILike(this.#parseNames(statement), value)

    return this
  }

  /**
   * Set an or where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {ModelQueryBuilder}
   */
  orWhereIn(columnName, values) {
    this.#QB.orWhereIn(this.#parseNames(columnName), values)

    return this
  }

  /**
   * Set an or where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {ModelQueryBuilder}
   */
  orWhereNotIn(columnName, values) {
    this.#QB.orWhereNotIn(this.#parseNames(columnName), values)

    return this
  }

  /**
   * Set an or where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {ModelQueryBuilder}
   */
  orWhereBetween(columnName, values) {
    this.#QB.orWhereBetween(this.#parseNames(columnName), values)

    return this
  }

  /**
   * Set an or where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {ModelQueryBuilder}
   */
  orWhereNotBetween(columnName, values) {
    this.#QB.orWhereNotBetween(this.#parseNames(columnName), values)

    return this
  }

  /**
   * Set an or where null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  orWhereNull(columnName) {
    this.#QB.orWhereNull(this.#parseNames(columnName))

    return this
  }

  /**
   * Set an or where not null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  orWhereNotNull(columnName) {
    this.#QB.orWhereNotNull(this.#parseNames(columnName))

    return this
  }

  /**
   * Set how many models should be skipped in your query.
   *
   * @param number {number}
   * @return {ModelQueryBuilder}
   */
  offset(number) {
    this.#QB.offset(number)

    return this
  }

  /**
   * Set the limit of models in your query.
   *
   * @param number {number}
   * @return {ModelQueryBuilder}
   */
  limit(number) {
    this.#QB.limit(number)

    return this
  }

  /**
   * Parse names using the schema builder.
   *
   * @param {string|string[]|Record<string, any>} statement
   * @return {any}
   */
  #parseNames(statement) {
    if (Is.Function(statement)) {
      return statement
    }

    if (Is.Object(statement)) {
      return this.#schema.getReversedStatementNamesOf(statement)
    }

    if (Is.Array(statement)) {
      return this.#schema.getReversedColumnNamesOf(statement)
    }

    return this.#schema.getReversedColumnNameOf(statement)
  }

  /**
   * Get data only from persist only.
   *
   * @param data {any}
   * @return {any|any[]}
   */
  #fillable(data) {
    if (!data) {
      return null
    }

    if (this.#Model.persistOnly[0] === '*') {
      return data
    }

    if (!Is.Array(data)) {
      Object.keys(data).forEach(key => {
        if (!this.#Model.persistOnly.includes(key)) {
          delete data[key]
        }
      })

      return data
    }

    return data.map(d => this.#fillable(d))
  }

  /**
   * Set the criterias on query builder.
   *
   * @return {void}
   */
  #setCriterias() {
    if (!this.#withCriterias) {
      return
    }

    Object.keys(this.#criterias).forEach(name => {
      const criteria = this.#criterias[name]

      for (const [key, value] of criteria.entries()) {
        this[key](...value)
      }
    })
  }
}
