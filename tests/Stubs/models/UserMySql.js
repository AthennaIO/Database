import { Model } from '#src/Models/Model'
import { Column } from '#src/Models/Column'
import { Relation } from '#src/Models/Relation'
import { ProductMySql } from '#tests/Stubs/models/ProductMySql'

export class UserMySql extends Model {
  /**
   * Set the db connection that this model instance will work with.
   *
   * @return {string}
   */
  static get connection() {
    return 'mysql'
  }

  /**
   * Set the table name of this model instance.
   *
   * @return {string}
   */
  static get table() {
    return 'users'
  }

  /**
   * The attributes that could be persisted in database.
   *
   *  @return {string[]}
   */
  static get persistOnly() {
    return ['id', 'name', 'email']
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
      email: Column.type('varchar').isHidden().isUnique().get(),
      products: Relation.oneToMany('user', ProductMySql, true),
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
      email: this.faker.internet.email(),
      createdAt: this.faker.date.recent(),
      updatedAt: this.faker.date.recent(),
      deletedAt: null,
    }
  }
}