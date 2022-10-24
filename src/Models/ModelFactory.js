/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class ModelFactory {
  /**
   * The model that we are going to use to generate
   * data.
   *
   * @type {any}
   */
  Model = null

  /**
   * The number of models to be created.
   *
   * @type {number}
   */
  #count = 1

  /**
   * Set the returning key that this factory will return.
   *
   * @type {string|null}
   */
  returning = null

  /**
   * Creates a new instance of ModelFactory.
   *
   * @param Model {any}
   * @param returning {string}
   * @return {ModelFactory}
   */
  constructor(Model, returning = '*') {
    this.Model = Model
    this.returning = returning
  }

  /**
   * Set the number of models to be created
   *
   * @param number
   * @return {ModelFactory}
   */
  count(number) {
    this.#count = number

    return this
  }

  /**
   * Make models without creating it on database.
   *
   * @param override {any}
   * @param asArrayOnOne {boolean}
   */
  async make(override = {}, asArrayOnOne = true) {
    const promises = []

    for (let i = 1; i <= this.#count; i++) {
      promises.push(this.#getDefinition(override, 'make'))
    }

    let data = await Promise.all(promises)

    if (this.returning !== '*') {
      data = data.map(d => d[this.returning])
    }

    if (asArrayOnOne && data.length === 1) {
      return data[0]
    }

    return data
  }

  /**
   * Create models creating it on database.
   *
   * @param override {any}
   * @param asArrayOnOne {boolean}
   */
  async create(override = {}, asArrayOnOne = true) {
    const promises = []

    for (let i = 1; i <= this.#count; i++) {
      promises.push(this.#getDefinition(override, 'create'))
    }

    let data = await this.Model.createMany(await Promise.all(promises), true)

    if (this.returning !== '*') {
      data = data.map(d => d[this.returning])
    }

    if (asArrayOnOne && data.length === 1) {
      return data[0]
    }

    return data
  }

  /**
   * Execute the definition method and return data.
   *
   * @param override {any}
   * @param method {string}
   * @return {Promise<any>}
   */
  async #getDefinition(override, method) {
    const data = await this.Model.definition()

    const promises = Object.keys(data).reduce((promises, key) => {
      if ((override && override[key]) || !(data[key] instanceof ModelFactory)) {
        return promises
      }

      const SubFactory = data[key]

      const result = SubFactory[method]().then(r => (data[key] = r))

      promises.push(result)

      return promises
    }, [])

    await Promise.all(promises)

    return {
      ...data,
      ...override,
    }
  }
}
