/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is, Json } from '@secjs/utils'

import { Database } from '#src/index'
import { NotImplementedRelationException } from '#src/Exceptions/NotImplementedRelationException'

export class ModelQueryBuilder {
  /**
   * The model that is using this instance.
   *
   * @type {any}
   */
  #Model

  /**
   * The database query builder instance used to handle database operations.
   *
   * @type {import('#src/index').QueryBuilder}
   */
  #QB

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
    this.#QB = Database.connection(model.connection).buildTable(model.table)
  }

  /**
   * Find one data in database or throw exception if undefined.
   *
   * @return {Promise<any>}
   */
  async findOrFail() {
    this.#setCriterias()

    return this.#generateModels(await this.#QB.findOrFail())
  }

  /**
   * Find one data in database.
   *
   * @return {Promise<any>}
   */
  async find() {
    this.#setCriterias()

    return this.#generateModels(await this.#QB.find())
  }

  /**
   * Find many data in database.
   *
   * @return {Promise<any[]>}
   */
  async findMany() {
    this.#setCriterias()

    return this.#generateModels(await this.#QB.findMany())
  }

  /**
   * Find many data in database and return as a Collection.
   *
   * @return {Promise<Collection>}
   */
  async collection() {
    this.#setCriterias()

    const collection = await this.#QB.collection()

    return collection.map(item => this.#generateModels(item))
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

    return { data: this.#generateModels(data), meta, links }
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

    return this.#generateModels(await this.#QB.create(data))
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

    return this.#generateModels(await this.#QB.createMany(data))
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

    return this.#generateModels(await this.#QB.createOrUpdate(data))
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

    return this.#generateModels(await this.#QB.update(data, force))
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
        await this.#QB.update({ [this.#Model.DELETED_AT]: new Date() }),
      )
    }

    return this.#generateModels(await this.#QB.delete())
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
    this.#QB.buildSelect(...columns)

    return this
  }

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {ModelQueryBuilder}
   */
  addSelect(...columns) {
    this.#QB.buildAddSelect(...columns)

    return this
  }

  /**
   * Set how many models should be skipped in your query.
   *
   * @param number {number}
   * @return {ModelQueryBuilder}
   */
  skip(number) {
    this.#QB.buildSkip(number)

    return this
  }

  /**
   * Set the limit of models in your query.
   *
   * @param number {number}
   * @return {ModelQueryBuilder}
   */
  limit(number) {
    this.#QB.buildLimit(number)

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
    this.#QB.buildOrderBy(columnName, direction)

    return this
  }

  /**
   * Include some relation in your query.
   *
   * @param [relationName] {string|any}
   * @return {ModelQueryBuilder}
   */
  includes(relationName) {
    const relations = []
    const schema = this.#Model.schema()

    Object.keys(schema).forEach(key => {
      const relation = schema[key]

      if (relation.isRelation) {
        relations.push(key)
      }
    })

    if (!relations.includes(relationName)) {
      throw new NotImplementedRelationException(
        relationName,
        this.#Model.name,
        relations.length ? relations.join(',') : null,
      )
    }

    this.#QB.buildIncludes(relationName)

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
    this.#QB.buildWhere(statement, value)

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
    this.#QB.buildWhereLike(statement, value)

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
    this.#QB.buildWhereILike(statement, value)

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
    this.#QB.buildWhereNot(statement, value)

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
    this.#QB.buildWhereIn(columnName, values)

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
    this.#QB.buildWhereNotIn(columnName, values)

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
    this.#QB.buildWhereBetween(columnName, values)

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
    this.#QB.buildWhereNotBetween(columnName, values)

    return this
  }

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  whereNull(columnName) {
    this.#QB.buildWhereNull(columnName)

    return this
  }

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  whereNotNull(columnName) {
    this.#QB.buildWhereNotNull(columnName)

    return this
  }

  /**
   * Generate model instances from data.
   *
   * @param {any|any[]|import('@secjs/utils').Collection} data
   */
  #generateModels(data) {
    if (!data) {
      return null
    }

    if (!Is.Array(data)) {
      const model = new this.#Model()

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
