/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Model } from '#src/models/Model'
import { ModelSchema } from '#src/models/schemas/ModelSchema'

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

  public constructor(model: new () => M) {
    this.Model = model
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.schema = model.schema()
  }

  /**
   * Generate one model instance with relations loaded.
   */
  public async generateOne(data: any): Promise<M> {
    return this.instantiateOne(data)
  }

  /**
   * Generate models instances with relations loaded.
   */
  public async generateMany(data: any[]): Promise<M[]> {
    if (!data || !data.length) {
      return []
    }

    return Promise.all(data.map(d => this.instantiateOne(d)))
  }

  /**
   * Instantiate one model using vanilla database data.
   */
  private instantiateOne(data: any): M {
    if (!data) {
      return undefined
    }

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
}
