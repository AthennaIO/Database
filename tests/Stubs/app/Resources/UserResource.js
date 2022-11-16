import { Resource } from '#src/Models/Resource'
import { ProductResource } from '#tests/Stubs/app/Resources/ProductResource'

export class UserResource extends Resource {
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
      email: object.email,
      products: ProductResource.toArray(object.products),
    }
  }
}
