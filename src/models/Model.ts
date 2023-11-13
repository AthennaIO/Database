/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { String } from '@athenna/common'
import { Database } from '#src/facades/Database'
import { ModelSchema } from '#src/models/schemas/ModelSchema'
import { ModelQueryBuilder } from '#src/models/builders/ModelQueryBuilder'

export class Model {
  /**
   * Set the connection name that model will use
   * to access database.
   */
  public static connection() {
    return Config.get('database.default')
  }

  /**
   * Set the table name of this model instance.
   */
  public static table(): string {
    return String.pluralize(String.toSnakeCase(this.name).toLowerCase())
  }

  /**
   * Create a new ModelSchema instance from your model.
   */
  public static schema() {
    return new ModelSchema(this)
  }

  /**
   * Create a query builder for the model.
   */
  public static query<T extends typeof Model>(this: T) {
    const driver = Database.connection(this.connection()).driver

    return new ModelQueryBuilder<InstanceType<T>, typeof driver>(this, driver)
  }
}
