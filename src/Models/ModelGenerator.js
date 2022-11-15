/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is } from '@athenna/common'
import { HasOneRelation } from '#src/Relations/HasOne/HasOneRelation'
import { HasManyRelation } from '#src/Relations/HasMany/HasManyRelation'
import { BelongsToRelation } from '#src/Relations/BelongsTo/BelongsToRelation'
import { BelongsToManyRelation } from '#src/Relations/BelongsToMany/BelongsToManyRelation'

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

    await this.includeRelations(model, relations)

    return this.#filterOneByHas(model, relations)
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

    await this.includeRelationsOfAll(models, relations)

    return this.#filterManyByHas(models, relations)
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
        return HasOneRelation.load(model, relation)
      case 'hasMany':
        return HasManyRelation.load(model, relation)
      case 'belongsTo':
        return BelongsToRelation.load(model, relation)
      case 'belongsToMany':
        return BelongsToManyRelation.load(model, relation)
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
        return HasOneRelation.loadAll(models, relation)
      case 'hasMany':
        return HasManyRelation.loadAll(models, relation)
      case 'belongsTo':
        return BelongsToRelation.loadAll(models, relation)
      case 'belongsToMany':
        return BelongsToManyRelation.loadAll(models, relation)
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

  /**
   * Filter the model by the has statement if it exists
   * in included relations.
   *
   * @param model {import('#src/index').Model}
   * @param relations {any[]}
   * @return {undefined|any}
   */
  #filterOneByHas(model, relations) {
    const hasRelations = relations.filter(relation => relation.has)

    if (!hasRelations.length) {
      return model
    }

    const couldBeReturned = hasRelations.map(hasRelation => {
      if (!Is.Array(model[hasRelation.name])) {
        return !!model[hasRelation.name]
      }

      const { operation, count } = hasRelation.has
      const length = model[hasRelation.name].length

      return this.#compare(length, operation, count)
    })

    if (couldBeReturned.includes(false)) {
      return undefined
    }

    return model
  }

  /**
   * Filter the models by the has statement if it exists
   * in included relations.
   *
   * @param models {import('#src/index').Model[]}
   * @param relations {any[]}
   * @return {undefined|any}
   */
  #filterManyByHas(models, relations) {
    return models.filter(model => this.#filterOneByHas(model, relations))
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
   * Compare the first and second value with dynamic
   * operator.
   *
   * @param first {any}
   * @param operator {string}
   * @param second {any}
   * @return {boolean}
   */
  #compare(first, operator, second) {
    switch (operator) {
      case '>':
        return first > second
      case '<':
        return first < second
      case '>=':
        return first >= second
      case '<=':
        return first <= second
      case '==':
        // eslint-disable-next-line eqeqeq
        return first == second
      case '!=':
        // eslint-disable-next-line eqeqeq
        return first != second
      case '=':
      case '===':
        return first === second
      case '<>':
      case '!==':
        return first !== second
    }
  }
}
