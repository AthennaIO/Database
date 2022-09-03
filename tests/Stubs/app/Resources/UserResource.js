import { Resource } from '#src/Helpers/Resource'

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
    }
  }
}
