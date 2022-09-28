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
  #Schema

  /**
   * Creates a new instance of ModelGenerator.
   *
   * @param QB {import('#src/index').QueryBuilder}
   * @param Model {import('#src/index').Model}
   * @param Schema {import('#src/index').SchemaBuilder}
   * @return {ModelGenerator}
   */
  constructor(QB, Model, Schema) {
    this.#QB = QB
    this.#Model = Model
    this.#Schema = Schema
  }

  /**
   * Generate one model instance with relations loaded.
   *
   * @param data
   * @return {Promise<any>}
   */
  async generateOne(data) {
    const model = this.#instantiateOne(data)
    const relations = this.#Schema.getIncludedRelations()

    return this.#includeRelations(model, relations)
  }

  /**
   * Generate models instances with relations loaded.
   *
   * @param data
   * @return {Promise<any>}
   */
  async generateMany(data) {
    return data.map(d => this.generateOne(d))
  }

  /**
   * Instantiate one model using vanilla database data.
   *
   * @param data {any}
   * @return {any}
   */
  #instantiateOne(data) {
    return this.#populate(data, new this.#Model())
  }

  /**
   * Instantiate models using vanilla database data.
   *
   * @param data {any[]}
   * @return {any[]}
   */
  #instantiateMany(data) {
    return data.map(d => this.#instantiateOne(d))
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
    const columnDictionary = this.#Schema.columnDictionary

    Object.keys(object).forEach(key => {
      if (key === '__v') {
        return
      }

      if (!columnDictionary[key]) {
        return
      }

      model[columnDictionary[key]] = object[key]
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
    return relations.map(relation => this.#includeRelation(model, relation))
  }
}
