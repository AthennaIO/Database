/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { BelongsToRelation } from '#src/Relations/BelongsToRelation'
import { HasManyRelation } from '#src/Relations/HasManyRelation'
import { HasOneRelation } from '#src/Relations/HasOneRelation'
import { ManyToManyRelation } from '#src/Relations/ManyToManyRelation'

export class ModelGenerator {
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
   * @return {Promise<any>}
   */
  async generateOne(data) {
    if (!data) {
      return undefined
    }

    const model = this.#instantiateOne(data)
    const relations = this.#schema.getIncludedRelations()

    return this.#includeRelations(model, relations)
  }

  /**
   * Generate models instances with relations loaded.
   *
   * @param data
   * @return {Promise<any>}
   */
  async generateMany(data) {
    if (!data.length) {
      return []
    }

    return Promise.all(data.map(d => this.generateOne(d)))
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

    return this.#populate(data, new this.#Model())
  }

  /**
   * Populate one object data in the model instance
   * using the column dictionary to map keys.
   *
   * @param object {any}
   * @param model {any}
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
   * @param model {any}
   * @param relation {any}
   * @return {Promise<any>}
   */
  async #includeRelation(model, relation) {
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
   * Include relations to model.
   *
   * @param model {any}
   * @param relations {any[]}
   * @return {Promise<any>}
   */
  async #includeRelations(model, relations) {
    if (!relations || !relations.length) {
      return model
    }

    await Promise.all(relations.map(r => this.#includeRelation(model, r)))

    return model
  }
}
