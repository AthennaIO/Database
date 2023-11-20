/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Model } from '#src/models/Model'
import type { ColumnOptions } from '#src/types'
import { Annotation } from '#src/helpers/Annotation'

export class ModelSchema<M extends Model = any> {
  /**
   * The model class that is going to be used
   * to craft the schema.
   */
  private Model: typeof Model

  public constructor(model: typeof Model) {
    this.Model = model
  }

  /**
   * Get the column options of the main primary key.
   */
  public getMainPrimaryKey(): ColumnOptions {
    const columns = Annotation.getColumnsMeta(this.Model)
    let options = columns.find(c => c.isMainPrimary)

    if (!options) {
      options = columns.find(c => c.name === 'id')
    }

    if (!options) {
      options = columns.find(c => c.name === '_id')
    }

    return options
  }

  /**
   * Get the column options where column has isDeleteDate
   * as true.
   */
  public getSoftDeleteColumn(): ColumnOptions {
    const columns = Annotation.getColumnsMeta(this.Model)

    return columns.find(c => c.isDeleteDate)
  }

  /**
   * Get the column options by the column database name.
   */
  public getColumnByName(column: string | keyof M): ColumnOptions {
    const columns = Annotation.getColumnsMeta(this.Model)

    return columns.find(c => c.name === column)
  }

  /**
   * Get the column options by the model class property.
   */
  public getColumnByProperty(property: string | keyof M): ColumnOptions {
    const columns = Annotation.getColumnsMeta(this.Model)

    return columns.find(c => c.property === property)
  }
}
