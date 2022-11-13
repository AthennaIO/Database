/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HasOneRelation } from '#src/Relations/HasOneRelation'
import { HasManyRelation } from '#src/Relations/HasManyRelation'
import { BelongsToRelation } from '#src/Relations/BelongsToRelation'
import { ManyToManyRelation } from '#src/Relations/ManyToManyRelation'

export class ModelGenerator {
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
   * Creates a new instance of ModelGenerator.
   *
   * @param Model {import('#src/index').Model}
   * @param schema {import('#src/index').SchemaBuilder}
   * @return {ModelGenerator}
   */
  constructor(Model, schema) {
    this.#Model = Model
    this.#schema = schema
  }

  /**
   * Generate one model instance with relations loaded.
   *
   * @param data
   * @return {Promise<import('#src/index').Model>}
   */
  async generateOne(data) {
    if (!data) {
      return undefined
    }

    const model = this.#instantiateOne(data)
    const relations = this.#schema.getIncludedRelations()

    return this.includeRelations(model, relations)
  }

  /**
   * Generate models instances with relations loaded.
   *
   * @param data
   * @return {Promise<import('#src/index').Model[]>}
   */
  async generateMany(data) {
    if (!data.length) {
      return []
    }

    const models = await Promise.all(data.map(d => this.#instantiateOne(d)))
    const relations = this.#schema.getIncludedRelations()

    return this.includeRelationsOfAll(models, relations)
  }

  /**
   * Instantiate one model using vanilla database data.
   *
   * @param data {any}
   * @return {any}
   */
  #instantiateOne(data) {
    if (!data) {
      return undefined
    }

    return this.#populate(data, new this.#Model(true))
  }

  /**
   * Populate one object data in the model instance
   * using the column dictionary to map keys.
   *
   * @param object {any}
   * @param model {import('#src/index').Model}
   * @return {any}
   */
  #populate(object, model) {
    const columnDictionary = this.#schema.columnDictionary

    const columns = this.#schema.columns

    Object.keys(object).forEach(key => {
      const property = columnDictionary[key]

      const column = columns.find(c => c.name === property)

      if (key === '__v') {
        return
      }

      if (!column) {
        model[key] = object[key]

        return
      }

      if (column.isHidden) {
        return
      }

      model[property] = object[key]
    })

    return model
  }

  /**
   * Include one relation to model.
   *
   * @param model {import('#src/index').Model}
   * @param relation {any}
   * @return {Promise<any>}
   */
  async includeRelation(model, relation) {
    switch (relation.type) {
      case 'hasOne':
        return new HasOneRelation().load(model, relation)
      case 'hasMany':
        return new HasManyRelation().load(model, relation)
      case 'belongsTo':
        return new BelongsToRelation().load(model, relation)
      case 'manyToMany':
        return new ManyToManyRelation().load(model, relation)
      default:
        return model
    }
  }

  /**
   * Include one relation to model.
   *
   * @param models {import('#src/index').Model[]}
   * @param relation {any}
   * @return {Promise<any>}
   */
  async includeRelationOfAll(models, relation) {
    switch (relation.type) {
      case 'hasOne':
        return new HasOneRelation().loadAll(models, relation)
      case 'hasMany':
        return new HasManyRelation().loadAll(models, relation)
      case 'belongsTo':
        return new BelongsToRelation().loadAll(models, relation)
      case 'manyToMany':
        return new ManyToManyRelation().loadAll(models, relation)
      default:
        return models
    }
  }

  /**
   * Include relations to model.
   *
   * @param model {import('#src/index').Model}
   * @param relations {any[]}
   * @return {Promise<any>}
   */
  async includeRelations(model, relations) {
    if (!relations || !relations.length) {
      return model
    }

    await Promise.all(relations.map(r => this.includeRelation(model, r)))

    return model
  }

  /**
   * Include the relations of all models.
   *
   * @param models {import('#src/index').Model[]}
   * @param relations {any[]}
   * @return {Promise<import('#src/index').Model[]>}
   */
  async includeRelationsOfAll(models, relations) {
    if (!relations || !relations.length) {
      return models
    }

    await Promise.all(relations.map(r => this.includeRelationOfAll(models, r)))

    return models
  }
}
