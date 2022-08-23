import { Model } from '#src/Models/Model'
import { Column } from '#src/Models/Column'
import { Relation } from '#src/Models/Relation'
import { User } from '#tests/Stubs/models/User'

export class Product extends Model {
  /**
   * Set the table name of this model instance.
   *
   * @return {string}
   */
  static get table() {
    return 'products'
  }

  /**
   * Set the primary key of your model.
   *
   * @return {string}
   */
  static get primaryKey() {
    return 'id'
  }

  /**
   * The attributes that could be persisted in database.
   *
   *  @return {string[]}
   */
  static get persistOnly() {
    return ['id', 'name', 'userId']
  }

  /**
   * The default schema for model instances.
   *
   * @return {any}
   */
  static schema() {
    return {
      id: Column.autoIncrementedIntPk(),
      name: Column.type('varchar').get(),
      userId: Column.type('int').get(),
      user: Relation.manyToOne('products', User),
      createdAt: Column.createdAt(),
      updatedAt: Column.updatedAt(),
      deletedAt: Column.deletedAt(),
    }
  }

  /**
   * The definition method used by factories.
   *
   * @return {any}
   */
  static async definition() {
    return {
      id: this.faker.datatype.number(),
      name: this.faker.name.fullName(),
      userId: User.factory('id'),
      createdAt: this.faker.datatype.datetime(),
      updatedAt: this.faker.datatype.datetime(),
      deletedAt: null,
    }
  }
}
