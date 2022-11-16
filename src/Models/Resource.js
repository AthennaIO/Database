/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Json } from '@athenna/common'

export class Resource {
  /**
   * Set your object blueprint to execute in resources.
   *
   * @param object
   * @return {any}
   */
  static blueprint(object) {
    return object
  }

  /**
   * Parse object to resource.
   *
   * @param object {any}
   * @return {null|any}
   */
  static toJson(object) {
    if (!object) {
      return null
    }

    const blueprint = this.blueprint(object)

    Object.keys(blueprint).forEach(key => {
      if (blueprint[key] === undefined) {
        delete blueprint[key]
      }
    })

    return Json.copy(blueprint)
  }

  /**
   * Parse models to resource.
   *
   * @param objects {any[]}
   * @return {null|any[]}
   */
  static toArray(objects) {
    if (!objects) {
      return null
    }

    if (!objects.length) {
      return []
    }

    return objects.map(object => this.toJson(object))
  }
}
