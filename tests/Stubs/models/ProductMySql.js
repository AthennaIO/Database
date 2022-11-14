import { Model, Column, Relation } from '#src/index'
import { UserMySql } from '#tests/Stubs/models/UserMySql'
import { ProductDetailMySql } from '#tests/Stubs/models/ProductDetailMySql'

export class ProductMySql extends Model {
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
    return 'products'
  }

  /**
   * Set the default attributes of your model.
   *
   * @return {Record<string, any>}
   */
  static get attributes() {
    return {
      name: this.faker.commerce.productName(),
      price: this.faker.commerce.price(),
    }
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
      name: Column.string('name', 200),
      price: Column.integer({ default: 0 }),
      userId: Column.integer(),
      user: Relation.belongsTo(UserMySql, 'products'),
      productDetails: Relation.hasMany(ProductDetailMySql, 'product'),
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
      userId: UserMySql.factory('id'),
      createdAt: this.faker.date.recent(),
      updatedAt: this.faker.date.recent(),
      deletedAt: null,
    }
  }

  userQuery() {
    return this.belongsTo(UserMySql, true)
  }
}
