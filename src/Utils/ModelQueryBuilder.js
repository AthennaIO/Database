/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is, Json } from '@secjs/utils'
import { Model } from '#src/Models/Model'

export class ModelQueryBuilder {
  /**
   * The model that is using this instance.
   *
   * @type {any}
   */
  #Model

  /**
   * The database instance used to handle database operations.
   *
   * @type {import('#src/index').Database}
   */
  #DB

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
   * @param DB
   * @return {ModelQueryBuilder}
   */
  constructor(model, DB, withCriterias) {
    DB.connection(model.connection).buildTable(model.table)

    this.#DB = DB
    this.#Model = model
    this.#withCriterias = withCriterias
  }

  /**
   * Find one data in database.
   *
   * @return {Promise<any>}
   */
  async find() {
    this.#setCriterias()

    return this.#generateModels(await this.#DB.find())
  }

  /**
   * Find many data in database.
   *
   * @return {Promise<any>}
   */
  async findMany() {
    this.#setCriterias()

    return this.#generateModels(await this.#DB.findMany())
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

    const { data, meta, links } = await this.#DB.paginate(
      page,
      limit,
      resourceUrl,
    )

    return { data: this.#generateModels(data), meta, links }
  }

  /**
   * Count the number of models in database.
   *
   * @return {Promise<number>}
   */
  async count() {
    this.#setCriterias()

    return this.#DB.count()
  }

  /**
   * Create one model in database.
   *
   * @param data {any}
   * @return {Promise<any>}
   */
  async create(data) {
    return this.#generateModels(await this.#DB.create(this.#fillable(data)))
  }

  /**
   * Create many models in database.
   *
   * @param data {any}
   * @return {Promise<any[]>}
   */
  async createMany(data) {
    return this.#generateModels(await this.#DB.createMany(this.#fillable(data)))
  }

  /**
   * Update one or more models in database.
   *
   * @param data {any}
   * @return {Promise<any|any[]>}
   */
  async update(data) {
    return this.#generateModels(await this.#DB.update(this.#fillable(data)))
  }

  /**
   * Delete one or more models in database.
   *
   * @param [force] {boolean}
   * @return {Promise<any|any[]|void>}
   */
  async delete(force = false) {
    if (this.#Model.isSoftDelete && !force) {
      return this.#generateModels(
        await this.#DB.update({ [this.#Model.DELETED_AT]: new Date() }),
      )
    }

    return this.#generateModels(await this.#DB.delete())
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
    if (withRemoved) {
      return this.#Model.criterias
    }

    const criterias = Json.copy(this.#Model.criterias)

    Object.keys(criterias).forEach(key => {
      if (this.#removedCriterias.includes(key)) {
        delete criterias[key]
      }
    })

    return criterias
  }

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {ModelQueryBuilder}
   */
  select(...columns) {
    this.#DB.buildSelect(...columns)

    return this
  }

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {ModelQueryBuilder}
   */
  addSelect(...columns) {
    this.#DB.buildAddSelect(...columns)

    return this
  }

  /**
   * Set how many models should be skipped in your query.
   *
   * @param number {number}
   * @return {ModelQueryBuilder}
   */
  skip(number) {
    this.#DB.buildSkip(number)

    return this
  }

  /**
   * Set the limit of models in your query.
   *
   * @param number {number}
   * @return {ModelQueryBuilder}
   */
  limit(number) {
    this.#DB.buildLimit(number)

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
    this.#DB.buildOrderBy(columnName, direction)

    return this
  }

  /**
   * Include some relation in your query.
   *
   * @param [relationName] {string|any}
   * @param [operation] {string}
   * @return {ModelQueryBuilder}
   */
  includes(relationName) {
    this.#DB.buildIncludes(relationName)

    return this
  }

  /**
   * Set a where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  where(statement, value) {
    this.#DB.buildWhere(statement, value)

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
    this.#DB.buildWhereLike(statement, value)

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
    this.#DB.buildWhereILike(statement, value)

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
    this.#DB.buildWhereNot(statement, value)

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
    this.#DB.buildWhereIn(columnName, values)

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
    this.#DB.buildWhereNotIn(columnName, values)

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
    this.#DB.buildWhereBetween(columnName, values)

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
    this.#DB.buildWhereNotBetween(columnName, values)

    return this
  }

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  whereNull(columnName) {
    this.#DB.buildWhereNull(columnName)

    return this
  }

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  whereNotNull(columnName) {
    this.#DB.buildWhereNotNull(columnName)

    return this
  }

  /**
   * Generate model instances from data.
   *
   * @param {any|any[]} data
   */
  #generateModels(data) {
    if (!data) {
      return null
    }

    if (!Is.Array(data)) {
      const model = new Model()

      Object.keys(data).forEach(key => (model[key] = data[key]))

      return model
    }

    return data.map(d => this.#generateModels(d))
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

    Object.keys(this.#Model.criterias).forEach(k => {
      if (this.#removedCriterias.includes(k)) {
        return
      }

      const criteria = this.#Model.criterias[k]

      for (const [key, value] of criteria.entries()) {
        this[key](...value)
      }
    })
  }
}
