/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Model } from '#src/models/Model'
import type { RelationOptions } from '#src/types'
import { ModelSchema } from '#src/models/schemas/ModelSchema'
import { HasOneRelation } from '#src/models/relations/HasOne/HasOneRelation'
import { BelongsToRelation } from '#src/models/relations/BelongsTo/BelongsToRelation'

export class ModelGenerator<M extends Model = any> {
  /**
   * The model that will be generated instances
   * from.
   */
  private Model: new () => M

  /**
   * The model schema that will be used to search
   * for columns and relations.
   */
  private schema: ModelSchema<M>

  public constructor(model: new () => M, schema: ModelSchema<M>) {
    this.Model = model
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.schema = schema
  }

  /**
   * Generate one model instance with relations loaded.
   */
  public async generateOne(data: any): Promise<M> {
    if (!data) {
      return undefined
    }

    const model = this.instantiateOne(data)

    return this.includeRelations(model)
  }

  /**
   * Generate models instances with relations loaded.
   */
  public async generateMany(data: any[]): Promise<M[]> {
    if (!data || !data.length) {
      return []
    }

    const models = await Promise.all(data.map(d => this.instantiateOne(d)))

    return this.includeRelationsOfAll(models)
  }

  /**
   * Instantiate one model using vanilla database data.
   */
  private instantiateOne(data: any): M {
    return this.populate(data, new this.Model())
  }

  /**
   * Populate one object data in the model instance
   * using the column dictionary to map keys.
   */
  private populate(object: unknown, model: M): M {
    Object.keys(object).forEach(key => {
      const column = this.schema.getColumnByName(key)

      if (!column || column.isHidden) {
        return
      }

      model[column.property] = object[key]
    })

    return model
  }

  /**
   * Include one relation to one model.
   */
  private async includeRelation(
    model: M,
    relation: RelationOptions
  ): Promise<M> {
    switch (relation.type) {
      case 'hasOne':
        return HasOneRelation.load(model, relation)
      // case 'hasMany':
      //   return HasManyRelation.load(model, relation)
      case 'belongsTo':
        return BelongsToRelation.load(model, relation)
      // case 'belongsToMany':
      //   return BelongsToManyRelation.load(model, relation)
      default:
        return model
    }
  }

  /**
   * Include all relations to one model.
   */
  private async includeRelations(model: M) {
    const relations = this.schema.getIncludedRelations()

    if (!relations || !relations.length) {
      return model
    }

    for (const relation of relations) {
      model = await this.includeRelation(model, relation)
    }

    return model
  }

  /**
   * Include one relation for all models.
   */
  private async includeRelationOfAll(
    models: M[],
    relation: RelationOptions
  ): Promise<M[]> {
    switch (relation.type) {
      case 'hasOne':
        return HasOneRelation.loadAll(models, relation)
      // case 'hasMany':
      //   return HasManyRelation.loadAll(models, relation)
      case 'belongsTo':
        return BelongsToRelation.loadAll(models, relation)
      // case 'belongsToMany':
      //   return BelongsToManyRelation.loadAll(models, relation)
      default:
        return models
    }
  }

  /**
   * Include all relations for all models.
   */
  private async includeRelationsOfAll(models: M[]) {
    const relations = this.schema.getIncludedRelations()

    if (!relations || !relations.length) {
      return models
    }

    for (const relation of relations) {
      models = await this.includeRelationOfAll(models, relation)
    }

    return models
  }
}
