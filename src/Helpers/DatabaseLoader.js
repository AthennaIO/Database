import { Module, Path } from '@secjs/utils'

export class DatabaseLoader {
  /**
   * Get the schema of all models with same connection.
   *
   * @param connection {string}
   * @param [path] {string}
   * @param [defaultConnection] {string}
   * @return {Promise<any[]>}
   */
  static async loadEntities(
    connection,
    path = Path.app('Models'),
    defaultConnection = process.env.DB_CONNECTION,
  ) {
    const schemas = []

    const Models = await Module.getAllFrom(path)

    Models.forEach(Model => {
      const modelConnection = Model.connection

      if (modelConnection === 'default' && connection === defaultConnection) {
        schemas.push(Model.getSchema())
      }

      if (modelConnection === connection) {
        schemas.push(Model.getSchema())
      }
    })

    return schemas
  }
}
