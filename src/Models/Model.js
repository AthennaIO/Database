/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Assert } from '@japa/assert'
import { faker } from '@faker-js/faker'
import { Is, String } from '@athenna/common'

import { Database } from '#src/index'
import { Criteria } from '#src/Models/Criteria'
import { ModelFactory } from '#src/Models/ModelFactory'
import { SchemaBuilder } from '#src/Models/SchemaBuilder'
import { ModelQueryBuilder } from '#src/Models/ModelQueryBuilder'
import { ManyToManyRelation } from '#src/Relations/ManyToManyRelation'
import { EmptyWhereException } from '#src/Exceptions/EmptyWhereException'
import { NotImplementedSchemaException } from '#src/Exceptions/NotImplementedSchemaException'
import { NotImplementedDefinitionException } from '#src/Exceptions/NotImplementedDefinitionException'

export class Model {
  /**
   * The faker instance to create fake data.
   *
   * @return {import('@faker-js/faker').Faker}
   */
  static get faker() {
    return faker
  }

  /**
   * Set the db connection that this model instance will work with.
   *
   * @return {string}
   */
  static get connection() {
    return 'default'
  }

  /**
   * Set the table name of this model instance.
   *
   * @return {string}
   */
  static get table() {
    return String.pluralize(this.name.toLowerCase())
  }

  /**
   * Set the primary key of your model.
   *
   * @return {string}
   */
  static get primaryKey() {
    return 'id'
  }

  /**
   * Set the default attributes of your model.
   *
   * @return {Record<string, any>}
   */
  static get attributes() {
    return {}
  }

  /**
   * The attributes that could be persisted in database.
   *
   *  @return {string[]}
   */
  static get persistOnly() {
    return ['*']
  }

  /**
   * Return a boolean specifying if Model will use soft delete.
   *
   *  @return {boolean}
   */
  static get isSoftDelete() {
    return false
  }

  /**
   * Return the DELETED_AT column name in database.
   *
   *  @return {string}
   */
  static get DELETED_AT() {
    return 'deletedAt'
  }

  /**
   * Return the criterias set to this model.
   *
   * @return {any}
   */
  static criterias() {
    const criterias = {}

    if (this.isSoftDelete) {
      criterias.deletedAt = Criteria.whereNull(this.DELETED_AT).get()
    }

    return criterias
  }

  /**
   * The default schema for model instances.
   *
   * @return {any}
   */
  static schema() {
    throw new NotImplementedSchemaException(this.name)
  }

  /**
   * The definition method used by factories.
   *
   * @return {any}
   */
  static async definition() {
    throw new NotImplementedDefinitionException(this.name)
  }

  /**
   * Create the factory object to generate data.
   *
   * @return {ModelFactory}
   */
  static factory(returning = '*') {
    return new ModelFactory(this, returning)
  }

  /**
   * The schema instance of this model.
   *
   * @return {SchemaBuilder}
   */
  static getSchema() {
    const schema = this.schema()

    return new SchemaBuilder()
      .setSchema(schema)
      .setName(this.table)
      .setTable(this.table)
      .setConnection(this.connection)
  }

  /**
   * Return the client of driver.
   *
   * @return {import('knex').Knex}
   */
  static getClient() {
    return Database.connection(this.connection).getClient()
  }

  /**
   * Return the query builder of driver.
   *
   * @return {import('knex').Knex.QueryBuilder}
   */
  static getQueryBuilder() {
    return Database.connection(this.connection).getQueryBuilder()
  }

  /**
   * Create a new model query builder.
   *
   * @param [withCriterias] {boolean}
   * @return {ModelQueryBuilder}
   */
  static query(withCriterias = true) {
    return new ModelQueryBuilder(this, withCriterias)
  }

  /**
   * Truncate all data in database of this model.
   *
   * @return {Promise<void>}
   */
  static truncate() {
    return Database.connection(this.connection).truncate(this.table)
  }

  /**
   * Count the number of matches with where in database.
   *
   * @param {any} [where]
   * @return {Promise<number>}
   */
  static async count(where = {}) {
    const query = this.query()

    if (Object.keys(where).length) {
      query.where(where)
    }

    return query.where(where).count()
  }

  /**
   * Get one data in DB and return as a subclass instance or
   * throw exception if undefined.
   *
   * @param {any} [where]
   * @return {Promise<InstanceType<this>>}
   */
  static async findOrFail(where = {}) {
    const query = this.query()

    if (Object.keys(where).length) {
      query.where(where)
    }

    return query.where(where).findOrFail()
  }

  /**
   * Return a single model instance or, if no results are found,
   * execute the given closure.
   *
   * @param where {any}
   * @param callback {() => Promise<any>}
   * @return {Promise<any>}
   */
  static async findOr(where = {}, callback) {
    const query = this.query()

    if (Object.keys(where).length) {
      query.where(where)
    }

    return query.where(where).findOr(callback)
  }

  /**
   * Get one data in DB and return as a subclass instance.
   *
   * @param {any} [where]
   * @return {Promise<InstanceType<this>>}
   */
  static async find(where = {}) {
    const query = this.query()

    if (Object.keys(where).length) {
      query.where(where)
    }

    return query.where(where).find()
  }

  /**
   * Get many data in DB and return as an array of subclass instance.
   *
   * @param {any} [where]
   * @return {Promise<InstanceType<this>[]>}
   */
  static async findMany(where = {}) {
    const query = this.query()

    if (Object.keys(where).length) {
      query.where(where)
    }

    return query.where(where).findMany()
  }

  /**
   * Get many data in DB and return as a collection of subclass instance.
   *
   * @param {any} [where]
   * @return {Promise<Collection<InstanceType<Class>>>}
   */
  static async collection(where = {}) {
    const query = this.query()

    if (Object.keys(where).length) {
      query.where(where)
    }

    return query.where(where).collection()
  }

  /**
   * Find many models in database and return as paginated response.
   *
   * @param [page] {boolean}
   * @param [limit] {boolean}
   * @param [resourceUrl] {string}
   * @param [where] {any}
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
  static async paginate(page = 0, limit = 10, resourceUrl = '/', where = {}) {
    const query = this.query()

    if (Object.keys(where).length) {
      query.where(where)
    }

    return query.paginate(page, limit, resourceUrl)
  }

  /**
   * Create a new model in DB and return as a subclass instance.
   *
   * @param {any} data
   * @param {boolean} ignorePersistOnly
   * @return {Promise<InstanceType<this>>}
   */
  static async create(data = {}, ignorePersistOnly = false) {
    return this.query().create(data, ignorePersistOnly)
  }

  /**
   * Create many models in DB and return as subclass instances.
   *
   * @param {any[]} data
   * @param {boolean} ignorePersistOnly
   * @return {Promise<InstanceType<this>[]>}
   */
  static async createMany(data = [], ignorePersistOnly = false) {
    return this.query().createMany(data, ignorePersistOnly)
  }

  /**
   * Create or update models in DB and return as subclass instances.
   *
   * @param {any} where
   * @param {any} data
   * @param {boolean} ignorePersistOnly
   * @return {Promise<InstanceType<this> | InstanceType<this>[]>}
   */
  static async createOrUpdate(
    where = {},
    data = {},
    ignorePersistOnly = false,
  ) {
    return this.query().where(where).createOrUpdate(data, ignorePersistOnly)
  }

  /**
   * Update a model in DB and return as a subclass instance.
   *
   * @param {any} where
   * @param {any} [data]
   * @param {boolean} ignorePersistOnly
   * @return {Promise<InstanceType<this>|InstanceType<this>[]>}
   */
  static async update(where, data = {}, ignorePersistOnly = false) {
    if (!Object.keys(where).length) {
      throw new EmptyWhereException('update')
    }

    return this.query().where(where).update(data, ignorePersistOnly)
  }

  /**
   * Delete a model in DB and return as a subclass instance or void.
   *
   * @param {any} where
   * @param {boolean} force
   * @return {Promise<InstanceType<this>|void>}
   */
  static async delete(where, force = false) {
    if (!Object.keys(where).length) {
      throw new EmptyWhereException('delete')
    }

    return this.query().where(where).delete(force)
  }

  /**
   * Assert that the model has been softly deleted.
   *
   * @param {any} where
   * @return {Promise<void>}
   */
  static async assertSoftDelete(where) {
    const model = await this.find(where)

    new Assert().isDefined(model[this.DELETED_AT])
  }

  /**
   * Assert that the number of respective model is the number.
   *
   * @param {number} number
   * @return {Promise<void>}
   */
  static async assertCount(number) {
    const count = await this.count()

    new Assert().equal(number, count)
  }

  /**
   * Assert that the values matches any model in database.
   *
   * @param {any} values
   * @return {Promise<void>}
   */
  static async assertExists(where) {
    const model = await this.find(where)

    new Assert().isDefined(model)
  }

  /**
   * Assert that the values does not match any model in database.
   *
   * @param {any} where
   * @return {Promise<void>}
   */
  static async assertNotExists(where) {
    const model = await this.find(where)

    new Assert().isUndefined(model)
  }

  /**
   * Defines if this model instance is generated by
   * the model generator or not.
   *
   * @type {boolean}
   */
  #isFromDatabase = false

  /**
   * Creates a new instance of your model.
   *
   * @param [isFromDatabase] {boolean}
   */
  constructor(isFromDatabase = false) {
    this.#isFromDatabase = isFromDatabase
  }

  /**
   * Return a Json object from the actual subclass instance.
   *
   * @return {any|any[]}
   */
  toJSON() {
    const json = {}

    Object.keys(this).forEach(key => (json[key] = this[key]))

    return json
  }

  /**
   * Return the model resource.
   *
   * @param [criterias] {any}
   * @return {any|any[]}
   */
  toResource(criterias = {}) {
    return this.toJSON()
  }

  /**
   * Update the model values that have been modified.
   *
   * @return {Promise<this>}
   */
  async save() {
    const Model = this.constructor
    const schema = Model.getSchema()

    if (!this.#isFromDatabase) {
      if (schema.hasTimestamp()) {
        const date = new Date()

        this[schema.getCreatedAt()] = this[schema.getCreatedAt()] || date
        this[schema.getUpdatedAt()] = this[schema.getUpdatedAt()] || date
      }

      const createdModel = await Model.create(this.toJSON(), true)

      Object.keys(createdModel).forEach(key => (this[key] = createdModel[key]))

      return this
    }

    const data = await this.#saveSubSchemas()
    const where = { [Model.primaryKey]: this[Model.primaryKey] }

    if (Is.Empty(data)) {
      return this
    }

    if (schema.hasUpdatedAt()) {
      data[schema.getUpdatedAt()] = data[schema.getUpdatedAt()] || new Date()
    }

    const updatedModel = await Model.update(where, data, true)

    Object.keys(updatedModel).forEach(key => (this[key] = updatedModel[key]))

    return this
  }

  /**
   * Delete or soft delete your model from database.
   *
   * @param {boolean} force
   * @return {Promise<void> | Promise<any>}
   */
  async delete(force = false) {
    const Model = this.constructor

    return Model.delete({ [Model.primaryKey]: this[Model.primaryKey] }, force)
  }

  /**
   * Re-retrieve the model from the database. The existing
   * model instance will not be affected.
   *
   * @return {Promise<this>}
   */
  async fresh() {
    const Model = this.constructor

    return Model.query()
      .where({ [Model.primaryKey]: this[Model.primaryKey] })
      .find()
  }

  /**
   * Re-retrieve the model from the database. The existing
   * model instance will not be affected.
   *
   * @return {Promise<this>}
   */
  async refresh() {
    const Model = this.constructor

    const relations = Model.getSchema().relations.map(r => r.name)

    const query = Model.query().where({
      [Model.primaryKey]: this[Model.primaryKey],
    })

    Object.keys(this).forEach(key => {
      if (!relations.includes(key)) {
        return
      }

      query.includes(key)
    })

    const data = await query.find()

    Object.keys(data).forEach(key => (this[key] = data[key]))
  }

  /**
   * Save all sub schema models inside instance and
   * return the json data without these schemas.
   *
   * @return {Promise<any>}
   */
  async #saveSubSchemas() {
    const Model = this.constructor
    const schema = Model.schema()
    const data = this.toJSON()

    const promises = []

    Object.keys(data).forEach(key => {
      const relationSchema = schema[key]

      if (!relationSchema || !relationSchema.isRelation) {
        return null
      }

      /**
       * Delete relation schema from json data.
       */
      delete data[key]

      if (relationSchema.type === 'manyToMany') {
        const relations = this[key]

        const subPromises = ManyToManyRelation.saveAll(
          this,
          relations,
          relationSchema,
        )

        subPromises.then(extras => (this.$extras = extras))

        promises.push(subPromises)
      }
    })

    await Promise.all(promises)

    return data
  }
}
