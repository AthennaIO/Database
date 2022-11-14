import { Model, Column, Relation } from '#src/index'
import { Capital } from '#tests/Stubs/models/Capital'

export class Country extends Model {
  /**
   * The attributes that could be persisted in database.
   *
   *  @return {string[]}
   */
  static get persistOnly() {
    return ['id', 'name', 'capitalId']
  }

  /**
   * The default schema for model instances.
   *
   * @return {any}
   */
  static schema() {
    return {
      id: Column.autoIncrementedUuid('id'),
      name: Column.string('name', 200),
      capital: Relation.hasOne(Capital, 'country'),
    }
  }

  /**
   * The definition method used by factories.
   *
   * @return {any}
   */
  static async definition() {
    return {
      id: this.faker.datatype.uuid(),
      name: this.faker.name.fullName(),
    }
  }

  capitalQuery() {
    return this.hasOne(Capital)
  }
}
