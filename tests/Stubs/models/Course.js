import { Column } from '#src/Builders/Column'
import { Relation } from '#src/Builders/Relation'
import { Model } from '#src/Models/Model'
import { Student } from '#tests/Stubs/models/Student'

export class Course extends Model {
  /**
   * Set the db connection that this model instance will work with.
   *
   * @return {string}
   */
  static get connection() {
    return 'mysql'
  }

  /**
   * The attributes that could be persisted in database.
   *
   *  @return {string[]}
   */
  static get persistOnly() {
    return ['id', 'name']
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
      students: Relation.manyToMany(Student, 'courses'),
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
}
