import { Model } from '#src/Models/Model'
import { Column } from '#src/Models/Column'
import { Relation } from '#src/Models/Relation'
import { User } from '#tests/Stubs/models/User'

export class Product extends Model {
  /**
   * The attributes that could be persisted in database.
   *
   *  @return {string[]}
   */
  static get persistOnly() {
    return ['id', 'name', 'userId']
  }

  /**
   * Return a boolean specifying if Model will use soft delete.
   *
   *  @return {boolean}
   */
  static get isSoftDelete() {
    return true
  }

  /**
   * The default schema for model instances.
   *
   * @return {any}
   */
  static schema() {
    return {
      id: Column.autoIncrementedInt('id'),
      name: Column.type('varchar').get(),
      price: Column.type('int').default(0).get(),
      userId: Column.type('int').get(),
      user: Relation.manyToOne('products', User),
      createdAt: Column.createdAt(),
      updatedAt: Column.updatedAt(),
      deletedAt: Column.deletedAt(this.DELETED_AT),
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
      price: this.faker.datatype.number(),
      userId: User.factory('id'),
      createdAt: this.faker.date.recent(),
      updatedAt: this.faker.date.recent(),
      deletedAt: null,
    }
  }
}
