import { Model, Column, Relation } from '#src/index'
import { UserMongo } from '#tests/Stubs/models/UserMongo'
import { ProductDetailMongo } from '#tests/Stubs/models/ProductDetailMongo'

export class ProductMongo extends Model {
  /**
   * Set the primary key of your model.
   *
   * @return {string}
   */
  static get primaryKey() {
    return 'id'
  }

  /**
   * Set the db connection that this model instance will work with.
   *
   * @return {string}
   */
  static get connection() {
    return 'mongo'
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
      id: this.faker.datatype.number(),
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
      id: Column.autoIncrementedObjectId('_id'),
      name: Column.string('name', 200),
      price: Column.integer({ default: 0 }),
      userId: Column.integer(),
      user: Relation.belongsTo(UserMongo, 'products'),
      productDetails: Relation.hasMany(ProductDetailMongo, 'product'),
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
      userId: UserMongo.factory('id'),
      createdAt: this.faker.date.recent(),
      updatedAt: this.faker.date.recent(),
      deletedAt: null,
    }
  }

  userQuery() {
    return this.belongsTo(UserMongo, true)
  }

  productDetailsQuery() {
    return this.hasMany(ProductDetailMongo, true)
  }
}
