/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { String } from '@secjs/utils'
import { Assert } from '@japa/assert'
import { EntitySchema } from 'typeorm'
import { faker } from '@faker-js/faker'

import { Criteria } from '#src/Models/Criteria'
import { ModelFactory } from '#src/Factories/ModelFactory'
import { ModelQueryBuilder } from '#src/Models/ModelQueryBuilder'
import { EmptyWhereException } from '#src/Exceptions/EmptyWhereException'
import { NotImplementedSchemaException } from '#src/Exceptions/NotImplementedSchemaException'
import { NotImplementedDefinitionException } from '#src/Exceptions/NotImplementedDefinitionException'

export class Model {
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
    return true
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
  static get criterias() {
    return {
      deletedAt: Criteria.whereNull(this.DELETED_AT).get(),
    }
  }

  /**
   * The faker instance to create fake data.
   *
   * @type {Faker}
   */
  static faker = faker

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
   * The TypeORM entity schema instance.
   *
   * @return {EntitySchema<any>}
   */
  static getSchema() {
    const schema = this.schema()

    const columns = {}
    const relations = {}

    Object.keys(schema).forEach(key => {
      const value = schema[key]

      if (value.isColumn) {
        delete value.isColumn

        columns[key] = value
      } else {
        delete value.isRelation

        relations[key] = value
      }
    })

    return new EntitySchema({
      name: this.table,
      tableName: this.table,
      columns,
      relations,
    })
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

    new Assert().deepEqual(number, count)
  }

  /**
   * Assert that the values matches any model in database.
   *
   * @param {any} values
   * @return {Promise<void>}
   */
  static async assertExists(where) {
    const model = await this.find(where)

    new Assert().isNotNull(model)
  }

  /**
   * Assert that the values does not match any model in database.
   *
   * @param {any} where
   * @return {Promise<void>}
   */
  static async assertNotExists(where) {
    const model = await this.find(where)

    new Assert().isNull(model)
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

  // TODO
  // async save()
}
