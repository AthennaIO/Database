/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Model } from '#src/models/Model'
import type { Driver } from '#src/drivers/Driver'
import { QueryBuilder } from '#src/database/builders/QueryBuilder'
import { ModelGenerator } from '#src/models/factories/ModelGenerator'

export class ModelQueryBuilder<
  M extends Model = any,
  D extends Driver = any
> extends QueryBuilder<M, D> {
  private Model: new () => M
  private generator: ModelGenerator

  public constructor(model: typeof Model, driver: D) {
    super(driver, model.table())

    this.Model = model as unknown as new () => M
    this.generator = new ModelGenerator<M>(this.Model as any)
  }

  public async find() {
    const data = await super.find()

    return this.generator.generateOne(data)
  }
}
