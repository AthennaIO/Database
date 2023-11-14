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
import { NotFoundDataException } from '#src/exceptions/NotFoundDataException'

export class ModelQueryBuilder<
  M extends Model = any,
  D extends Driver = any
> extends QueryBuilder<M, D> {
  private Model: new () => M
  private generator: ModelGenerator<M>

  public constructor(model: typeof Model, driver: D) {
    super(driver, model.table())

    this.Model = model as unknown as new () => M
    this.generator = new ModelGenerator<M>(this.Model as any)
  }

  /**
   * Find a value in database.
   */
  public async find() {
    const data = await super.find()

    return this.generator.generateOne(data)
  }

  /**
   * Find a value in database or throw exception if undefined.
   */
  public async findOrFail() {
    const data = await this.find()

    if (!data) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      throw new NotFoundDataException(this.Model.connection())
    }

    return data
  }

  /**
   * Return a single data or, if no results are found,
   * execute the given closure.
   */
  public async findOr<T = M>(closure: () => T | Promise<T>): Promise<T> {
    const data = (await this.find()) as T

    if (!data) {
      return closure()
    }

    return data
  }
}
