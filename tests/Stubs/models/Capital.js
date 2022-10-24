import { Column } from '#src/Models/Column'
import { Relation } from '#src/Relations/Relation'
import { Model } from '#src/Models/Model'
import { Country } from '#tests/Stubs/models/Country'

export class Capital extends Model {
  /**
   * The attributes that could be persisted in database.
   *
   *  @return {string[]}
   */
  static get persistOnly() {
    return ['id', 'name', 'countryId']
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
      countryId: Column.uuid(),
      country: Relation.belongsTo(Country, 'capital'),
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
      countryId: Country.factory('id'),
    }
  }
}
