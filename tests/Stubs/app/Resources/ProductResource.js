import { Resource } from '#src/Models/Resource'

export class ProductResource extends Resource {
  /**
   * Set your object blueprint to execute in resources.
   *
   * @param object
   * @return {any}
   */
  static blueprint(object) {
    return {
      id: object.id,
      name: object.name,
    }
  }
}
