/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is, Uuid } from '@athenna/common'

import { Database } from '#src/index'
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
   * @type {import('#src/index').Model}
   */
  #Model

  /**
   * The model schema used to map database operations.
   *
   * @type {import('#src/index').SchemaBuilder}
   */
  #schema

  /**
   * The model generator to create model instances and retrive relations.
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
   * All the criterias that should be removed by query builder.
   *
   * @type {string[]}
   */
  #removedCriterias = []

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
   * Find one data in database or throw exception if undefined.
   *
   * @return {Promise<any>}
   */
  async findOrFail() {
    this.#setCriterias()

    return this.#generator.generateOne(await this.#QB.findOrFail())
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
   * Count the number of models in database.
   *
   * @return {Promise<number>}
   */
  async count() {
    this.#setCriterias()

    return this.#QB.count()
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

    return this.#generator.generateMany(await this.#QB.createMany(data))
  }

  /**
   * Create or update models in database.
   *
   * @param data {any | any[]}
   * @param {boolean} ignorePersistOnly
   * @return {Promise<any | any[]>}
   */
  async createOrUpdate(data, ignorePersistOnly = false) {
    if (!ignorePersistOnly) {
      data = this.#fillable(data)
    }

    return this.#generator.generateOne(await this.#QB.createOrUpdate(data))
  }

  /**
   * Update one or more models in database.
   *
   * @param data {any}
   * @param {boolean} ignorePersistOnly
   * @param {boolean} force
   * @return {Promise<any|any[]>}
   */
  async update(data, ignorePersistOnly = false, force = false) {
    if (!ignorePersistOnly) {
      data = this.#fillable(data)
    }

    const result = await this.#QB.update(data, force)

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
   * Remove the criteria from query builder by name.
   *
   * @param name
   * @return {ModelQueryBuilder}
   */
  removeCriteria(name) {
    this.#removedCriterias.push(name)

    return this
  }

  /**
   * List the criterias from query builder.
   *
   * @param withRemoved {boolean}
   * @return {any}
   */
  listCriterias(withRemoved = false) {
    const criterias = this.#Model.criterias()

    if (withRemoved) {
      return criterias
    }

    const activeCriterias = {}

    Object.keys(criterias).forEach(key => {
      if (!this.#removedCriterias.includes(key)) {
        activeCriterias[key] = criterias[key]
      }
    })

    return activeCriterias
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

    this.#QB.select(...columns)

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
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.orderBy(columnName, direction.toLowerCase())

    return this
  }

  /**
   * Set the group by in your query.
   *
   * @param columns {string}
   * @return {ModelQueryBuilder}
   */
  groupBy(...columns) {
    columns = this.#schema.getReversedColumnNamesOf(columns)

    this.#QB.groupBy(...columns)

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
    column = this.#schema.getReversedColumnNameOf(column)

    if (!value) {
      this.#QB.having(column, '=', operation)

      return this
    }

    this.#QB.having(column, operation, value)

    return this
  }

  /**
   * Set a having exists statement in your query.
   *
   * @param builder {ModelQueryBuilder}
   * @return {ModelQueryBuilder}
   */
  havingExists(builder) {
    this.#QB.havingExists(builder)

    return this
  }

  /**
   * Set a having not exists statement in your query.
   *
   * @param builder {ModelQueryBuilder}
   * @return {ModelQueryBuilder}
   */
  havingNotExists(builder) {
    this.#QB.havingNotExists(builder)

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
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.havingIn(columnName, values)

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
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.havingNotIn(columnName, values)

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
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.havingBetween(columnName, values)

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
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.havingNotBetween(columnName, values)

    return this
  }

  /**
   * Set a having null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  havingNull(columnName) {
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.havingNull(columnName)

    return this
  }

  /**
   * Set a having not null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  havingNotNull(columnName) {
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.havingNotNull(columnName)

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
    column = this.#schema.getReversedColumnNameOf(column)

    if (!value) {
      this.#QB.orHaving(column, '=', operation)

      return this
    }

    this.#QB.orHaving(column, operation, value)

    return this
  }

  /**
   * Set an or having exists statement in your query.
   *
   * @param builder {ModelQueryBuilder}
   * @return {ModelQueryBuilder}
   */
  orHavingExists(builder) {
    this.#QB.orHavingExists(builder)

    return this
  }

  /**
   * Set an or having not exists statement in your query.
   *
   * @param builder {ModelQueryBuilder}
   * @return {ModelQueryBuilder}
   */
  orHavingNotExists(builder) {
    this.#QB.orHavingNotExists(builder)

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
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.orHavingIn(columnName, values)

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
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.orHavingNotIn(columnName, values)

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
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.orHavingBetween(columnName, values)

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
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.orHavingNotBetween(columnName, values)

    return this
  }

  /**
   * Set an or having null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  orHavingNull(columnName) {
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.orHavingNull(columnName)

    return this
  }

  /**
   * Set an or having not null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  orHavingNotNull(columnName) {
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.orHavingNotNull(columnName)

    return this
  }

  /**
   * Include some relation in your query.
   *
   * @param relationName {string|any}
   * @param [callback] {any}
   * @return {ModelQueryBuilder}
   */
  includes(relationName, callback) {
    const relations = this.#schema.relations
    const relation = relations.find(r => r.name === relationName)

    if (!relation) {
      throw new NotImplementedRelationException(
        relationName,
        this.#Model.name,
        relations.length ? relations.join(',') : null,
      )
    }

    const index = relations.indexOf(relation)

    relation.isIncluded = true
    relation.callback = callback

    this.#schema.relations[index] = relation

    return this
  }

  /**
   * Set a where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [operation] {string}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  where(statement, operation, value) {
    if (Is.Object(statement)) {
      statement = this.#schema.getReversedStatementNamesOf(statement)

      this.#QB.where(statement)

      return this
    }

    statement = this.#schema.getReversedColumnNameOf(statement)

    if (!value) {
      this.#QB.where(statement, operation)

      return this
    }

    this.#QB.where(statement, operation, value)

    return this
  }

  /**
   * Set a where not statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  whereNot(statement, value) {
    if (!value) {
      statement = this.#schema.getReversedStatementNamesOf(statement)

      this.#QB.whereNot(statement)

      return this
    }

    statement = this.#schema.getReversedColumnNameOf(statement)

    this.#QB.whereNot(statement, value)

    return this
  }

  /**
   * Set a where exists statement in your query.
   *
   * @param builder {ModelQueryBuilder}
   * @return {ModelQueryBuilder}
   */
  whereExists(builder) {
    this.#QB.whereExists(builder)

    return this
  }

  /**
   * Set a where not exists statement in your query.
   *
   * @param builder {ModelQueryBuilder}
   * @return {ModelQueryBuilder}
   */
  whereNotExists(builder) {
    this.#QB.whereNotExists(builder)

    return this
  }

  /**
   * Set a where like statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  whereLike(statement, value) {
    if (!value) {
      statement = this.#schema.getReversedStatementNamesOf(statement)

      this.#QB.whereLike(statement)

      return this
    }

    statement = this.#schema.getReversedColumnNameOf(statement)

    this.#QB.whereLike(statement, value)

    return this
  }

  /**
   * Set a where ILike statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  whereILike(statement, value) {
    if (!value) {
      statement = this.#schema.getReversedStatementNamesOf(statement)

      this.#QB.whereILike(statement)

      return this
    }

    statement = this.#schema.getReversedColumnNameOf(statement)

    this.#QB.whereILike(statement, value)

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
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.whereIn(columnName, values)

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
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.whereNotIn(columnName, values)

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
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.whereBetween(columnName, values)

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
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.whereNotBetween(columnName, values)

    return this
  }

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  whereNull(columnName) {
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.whereNull(columnName)

    return this
  }

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  whereNotNull(columnName) {
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.whereNotNull(columnName)

    return this
  }

  /**
   * Set a or where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [operation] {string}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  orWhere(statement, operation, value) {
    if (Is.Object(statement)) {
      statement = this.#schema.getReversedStatementNamesOf(statement)

      this.#QB.orWhere(statement)

      return this
    }

    statement = this.#schema.getReversedColumnNameOf(statement)

    if (!value) {
      this.#QB.orWhere(statement, operation)

      return this
    }

    this.#QB.orWhere(statement, operation, value)

    return this
  }

  /**
   * Set an or where not statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  orWhereNot(statement, value) {
    if (!value) {
      statement = this.#schema.getReversedStatementNamesOf(statement)

      this.#QB.orWhereNot(statement)

      return this
    }

    statement = this.#schema.getReversedColumnNameOf(statement)

    this.#QB.orWhereNot(statement, value)

    return this
  }

  /**
   * Set an or where exists statement in your query.
   *
   * @param builder {ModelQueryBuilder}
   * @return {ModelQueryBuilder}
   */
  orWhereExists(builder) {
    this.#QB.orWhereExists(builder)

    return this
  }

  /**
   * Set an or where not exists statement in your query.
   *
   * @param builder {ModelQueryBuilder}
   * @return {ModelQueryBuilder}
   */
  orWhereNotExists(builder) {
    this.#QB.orWhereNotExists(builder)

    return this
  }

  /**
   * Set an or where like statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  orWhereLike(statement, value) {
    if (!value) {
      statement = this.#schema.getReversedStatementNamesOf(statement)

      this.#QB.orWhereLike(statement)

      return this
    }

    statement = this.#schema.getReversedColumnNameOf(statement)

    this.#QB.orWhereLike(statement, value)

    return this
  }

  /**
   * Set an or where ILike statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  orWhereILike(statement, value) {
    if (!value) {
      statement = this.#schema.getReversedStatementNamesOf(statement)

      this.#QB.orWhereILike(statement)

      return this
    }

    statement = this.#schema.getReversedColumnNameOf(statement)

    this.#QB.orWhereILike(statement, value)

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
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.orWhereIn(columnName, values)

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
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.orWhereNotIn(columnName, values)

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
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.orWhereBetween(columnName, values)

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
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.orWhereNotBetween(columnName, values)

    return this
  }

  /**
   * Set an or where null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  orWhereNull(columnName) {
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.orWhereNull(columnName)

    return this
  }

  /**
   * Set an or where not null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  orWhereNotNull(columnName) {
    columnName = this.#schema.getReversedColumnNameOf(columnName)

    this.#QB.orWhereNotNull(columnName)

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

    const criterias = this.#Model.criterias()

    Object.keys(criterias).forEach(criteriaName => {
      if (this.#removedCriterias.includes(criteriaName)) {
        return
      }

      const criteria = criterias[criteriaName]

      for (const [key, value] of criteria.entries()) {
        this[key](...value)
      }
    })
  }
}
