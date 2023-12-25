/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Database } from '#src/facades/Database'
import { BaseModel } from '#src/models/BaseModel'
import { Column } from '#src/models/annotations/Column'
import { HasOne } from '#src/models/annotations/HasOne'
import { ModelSchema } from '#src/models/schemas/ModelSchema'
import { DatabaseProvider } from '#src/providers/DatabaseProvider'
import { Test, type Context, AfterEach, BeforeEach, Cleanup } from '@athenna/test'
import { NotImplementedRelationException } from '#src/exceptions/NotImplementedRelationException'

export default class ModelSchemaTest {
  @BeforeEach()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))

    new DatabaseProvider().register()
  }

  @AfterEach()
  public afterEach() {
    Config.clear()
    ioc.reconstruct()
  }

  @Test()
  public async shouldBeAbleToGetModelNameFromSchema({ assert }: Context) {
    class User extends BaseModel {
      @Column()
      public id: string
    }

    const name = new ModelSchema(User).getModelName()

    assert.deepEqual(name, 'User')
  }

  @Test()
  public async shouldBeAbleToGetModelConnectionFromSchema({ assert }: Context) {
    Config.set('database.default', 'fake')
    Config.set('database.connections.fake.driver', 'fake')

    class User extends BaseModel {
      @Column()
      public id: string
    }

    const connection = new ModelSchema(User).getModelConnection()

    assert.deepEqual(connection, 'fake')
  }

  @Test()
  public async shouldBeAbleToGetModelColumnByProperty({ assert }: Context) {
    class User {
      @Column()
      public id: string
    }

    const column = new ModelSchema(User).getColumnByProperty('id')

    assert.deepEqual(column, {
      defaultTo: null,
      isCreateDate: false,
      isDeleteDate: false,
      isHidden: false,
      isMainPrimary: false,
      isNullable: true,
      isIndex: false,
      isSparse: false,
      isPrimary: false,
      isUnique: false,
      isUpdateDate: false,
      name: 'id',
      persist: true,
      property: 'id',
      type: String
    })
  }

  @Test()
  public async shouldReturnUndefinedWhenSearchingByPropertyAndDoesNotExist({ assert }: Context) {
    class User {
      @Column()
      public id: string
    }

    const column = new ModelSchema(User).getColumnByProperty('not-found')

    assert.isUndefined(column)
  }

  @Test()
  public async shouldBeAbleToGetModelColumnByDatabaseColumnName({ assert }: Context) {
    class User {
      @Column({ name: '_id' })
      public id: string
    }

    const column = new ModelSchema(User).getColumnByName('_id')

    assert.deepEqual(column, {
      defaultTo: null,
      isCreateDate: false,
      isDeleteDate: false,
      isHidden: false,
      isMainPrimary: false,
      isNullable: true,
      isIndex: false,
      isSparse: false,
      isPrimary: false,
      isUnique: false,
      isUpdateDate: false,
      name: '_id',
      persist: true,
      property: 'id',
      type: String
    })
  }

  @Test()
  public async shouldReturnUndefinedWhenSearchingByDatabaseColumnNameAndDoesNotExist({ assert }: Context) {
    class User {
      @Column()
      public id: string
    }

    const column = new ModelSchema(User).getColumnByName('not-found')

    assert.isUndefined(column)
  }

  @Test()
  public async shouldBeAbleToGetTheModelCreatedAtColumnOptions({ assert }: Context) {
    class User {
      @Column({ isCreateDate: true })
      public createdAt: Date
    }

    const column = new ModelSchema(User).getCreatedAtColumn()

    assert.deepEqual(column, {
      defaultTo: null,
      isCreateDate: true,
      isDeleteDate: false,
      isHidden: false,
      isMainPrimary: false,
      isNullable: true,
      isIndex: false,
      isSparse: false,
      isPrimary: false,
      isUnique: false,
      isUpdateDate: false,
      name: 'createdAt',
      persist: true,
      property: 'createdAt',
      type: Date
    })
  }

  @Test()
  public async shouldBeAbleToGetTheModelUpdatedAtColumnOptions({ assert }: Context) {
    class User {
      @Column({ isUpdateDate: true })
      public updatedAt: Date
    }

    const column = new ModelSchema(User).getUpdatedAtColumn()

    assert.deepEqual(column, {
      defaultTo: null,
      isCreateDate: false,
      isDeleteDate: false,
      isHidden: false,
      isMainPrimary: false,
      isNullable: true,
      isIndex: false,
      isSparse: false,
      isPrimary: false,
      isUnique: false,
      isUpdateDate: true,
      name: 'updatedAt',
      persist: true,
      property: 'updatedAt',
      type: Date
    })
  }

  @Test()
  public async shouldBeAbleToGetTheModelDeletedAtColumnOptions({ assert }: Context) {
    class User {
      @Column({ isDeleteDate: true })
      public deletedAt: Date
    }

    const column = new ModelSchema(User).getDeletedAtColumn()

    assert.deepEqual(column, {
      defaultTo: null,
      isCreateDate: false,
      isDeleteDate: true,
      isHidden: false,
      isMainPrimary: false,
      isNullable: true,
      isIndex: false,
      isSparse: false,
      isPrimary: false,
      isUnique: false,
      isUpdateDate: false,
      name: 'deletedAt',
      persist: true,
      property: 'deletedAt',
      type: Date
    })
  }

  @Test()
  public async shouldBeAbleToGetTheModelMainPrimaryKeyColumnOptions({ assert }: Context) {
    class User {
      @Column({ isMainPrimary: true })
      public id: string
    }

    const column = new ModelSchema(User).getMainPrimaryKey()

    assert.deepEqual(column, {
      defaultTo: null,
      isCreateDate: false,
      isDeleteDate: false,
      isHidden: false,
      isNullable: true,
      isIndex: false,
      isSparse: false,
      isPrimary: true,
      isUnique: false,
      isUpdateDate: false,
      isMainPrimary: true,
      name: 'id',
      persist: true,
      property: 'id',
      type: String
    })
  }

  @Test()
  public async shouldBeAbleToGetTheModelMainPrimaryKeyNameDirectly({ assert }: Context) {
    class User {
      @Column({ name: '_id', isMainPrimary: true })
      public id: string
    }

    const column = new ModelSchema(User).getMainPrimaryKeyName()

    assert.deepEqual(column, '_id')
  }

  @Test()
  public async shouldBeAbleToGetTheModelMainPrimaryKeyPropertyDirectly({ assert }: Context) {
    class User {
      @Column({ name: '_id', isMainPrimary: true })
      public id: string
    }

    const column = new ModelSchema(User).getMainPrimaryKeyProperty()

    assert.deepEqual(column, 'id')
  }

  @Test()
  public async shouldBeAbleToGetAllModelColumnNamesByArrayOfModelProperties({ assert }: Context) {
    class User {
      @Column({ name: '_id' })
      public id: string
    }

    const columns = new ModelSchema(User).getColumnNamesByProperties(['id'])

    assert.deepEqual(columns, ['_id'])
  }

  @Test()
  public async shouldReturnThePropertiesWhenColumnNamesCannotBeFound({ assert }: Context) {
    class User {
      @Column({ name: '_id' })
      public id: string
    }

    const columns = new ModelSchema(User).getColumnNamesByProperties(['not-found'])

    assert.deepEqual(columns, ['not-found'])
  }

  @Test()
  public async shouldBeAbleToGetAllModelColumnPropertiesByArrayOfModelColumns({ assert }: Context) {
    class User {
      @Column({ name: '_id' })
      public id: string
    }

    const properties = new ModelSchema(User).getPropertiesByColumnNames(['_id'])

    assert.deepEqual(properties, ['id'])
  }

  @Test()
  public async shouldReturnTheColumnNamesWhenPropertiesCannotBeFound({ assert }: Context) {
    class User {
      @Column({ name: '_id' })
      public id: string
    }

    const properties = new ModelSchema(User).getPropertiesByColumnNames(['not-found'])

    assert.deepEqual(properties, ['not-found'])
  }

  @Test()
  public async shouldBeAbleToGetPropertyNameByColumnName({ assert }: Context) {
    class User {
      @Column({ name: '_id' })
      public id: string
    }

    const property = new ModelSchema(User).getPropertyByColumnName('_id')

    assert.deepEqual(property, 'id')
  }

  @Test()
  public async shouldReturnTheColumnNameIfThePropertyCannotBeFound({ assert }: Context) {
    class User {
      @Column({ name: '_id' })
      public id: string
    }

    const property = new ModelSchema(User).getPropertyByColumnName('not-found')

    assert.deepEqual(property, 'not-found')
  }

  @Test()
  public async shouldBeAbleToGetTheColumnNameByProperty({ assert }: Context) {
    class User {
      @Column({ name: '_id' })
      public id: string
    }

    const column = new ModelSchema(User).getColumnNameByProperty('id')

    assert.deepEqual(column, '_id')
  }

  @Test()
  public async shouldReturnThePropertyIfTheColumnNameCannotBeFound({ assert }: Context) {
    class User {
      @Column({ name: '_id' })
      public id: string
    }

    const column = new ModelSchema(User).getColumnNameByProperty('not-found')

    assert.deepEqual(column, 'not-found')
  }

  @Test()
  public async shouldBeAbleToParseAnObjectUsingPropertiesToColumnNames({ assert }: Context) {
    class User {
      @Column({ name: '_id' })
      public id: string
    }

    const parsed = new ModelSchema(User).propertiesToColumnNames({ id: 1 })

    assert.deepEqual(parsed, { _id: 1 })
  }

  @Test()
  public async shouldBeAbleToParseAnObjectUsingPropertiesToColumnNamesAndGetOnlyTheOnesThatShouldBePersisted({
    assert
  }: Context) {
    class User {
      @Column({ name: '_id', persist: true })
      public id: string

      @Column({ persist: false })
      public name: string
    }

    const parsed = new ModelSchema(User).propertiesToColumnNames({ id: 1 }, { cleanPersist: true })

    assert.deepEqual(parsed, { _id: 1 })
  }

  @Test()
  public async shouldBeAbleToParseAnObjectUsingPropertiesToColumnNamesAndSetDefaultAttributes({ assert }: Context) {
    class User {
      @Column({ name: '_id', persist: true })
      public id: string
    }

    const parsed = new ModelSchema(User).propertiesToColumnNames({}, { attributes: { id: 2 } })

    assert.deepEqual(parsed, { _id: 2 })
  }

  @Test()
  public async shouldBeAbleToParseAnObjectUsingPropertiesToColumnNamesAndStillSetDefaultAttributesInColumnsWithPersistDisabled({
    assert
  }: Context) {
    class User {
      @Column({ name: '_id', persist: true })
      public id: string

      @Column({ persist: false })
      public name: string
    }

    const parsed = new ModelSchema(User).propertiesToColumnNames(
      { id: 1 },
      { cleanPersist: true, attributes: { name: 'lenon' } }
    )

    assert.deepEqual(parsed, { _id: 1, name: 'lenon' })
  }

  @Test()
  public async shouldBeAbleToParseAnObjectUsingPropertiesToColumnNamesAndDefaultAttributesShouldChangeValuesThatCouldntBePersisted({
    assert
  }: Context) {
    class User {
      @Column({ name: '_id', persist: true })
      public id: string

      @Column({ persist: false })
      public name: string
    }

    const parsed = new ModelSchema(User).propertiesToColumnNames(
      { id: 1, name: 'txsoura' },
      { cleanPersist: true, attributes: { id: 2, name: 'lenon' } }
    )

    assert.deepEqual(parsed, { _id: 1, name: 'lenon' })
  }

  @Test()
  public async shouldBeAbleToParseAnObjectUsingPropertiesToColumnNamesEvenIfPropertiesAreNotSet({ assert }: Context) {
    class User {}

    const parsed = new ModelSchema(User).propertiesToColumnNames({ id: 1, name: 'lenon' })

    assert.deepEqual(parsed, { id: 1, name: 'lenon' })
  }

  @Test()
  public async shouldBeAbleToParseAnObjectUsingPropertiesToColumnNamesWithDefaultAttributesEvenIfPropertiesAreNotSet({
    assert
  }: Context) {
    class User {}

    const parsed = new ModelSchema(User).propertiesToColumnNames({ id: 1 }, { attributes: { name: 'lenon' } })

    assert.deepEqual(parsed, { id: 1, name: 'lenon' })
  }

  @Test()
  public async shouldBeAbleToGetAHasOneRelationOptionByClassPropertyName({ assert }: Context) {
    class Profile extends BaseModel {}
    class User extends BaseModel {
      @HasOne(() => Profile)
      public profile: Profile
    }

    const relation = new ModelSchema(User).getRelationByProperty('profile')

    assert.isFalse(relation.isIncluded)
    assert.isUndefined(relation.closure)
    assert.deepEqual(relation.type, 'hasOne')
    assert.deepEqual(relation.model(), Profile)
    assert.deepEqual(relation.primaryKey, 'id')
    assert.deepEqual(relation.property, 'profile')
    assert.deepEqual(relation.foreignKey, 'userId')
  }

  @Test()
  public async shouldBeAbleToIncludeAHasOneRelationByClassPropertyName({ assert }: Context) {
    class Profile extends BaseModel {}
    class User extends BaseModel {
      @HasOne(() => Profile)
      public profile: Profile
    }

    const schema = new ModelSchema(User)
    const relation = schema.includeRelation('profile')

    assert.isTrue(relation.isIncluded)
    assert.isUndefined(relation.closure)
    assert.deepEqual(relation.type, 'hasOne')
    assert.deepEqual(relation.model(), Profile)
    assert.deepEqual(relation.primaryKey, 'id')
    assert.deepEqual(relation.property, 'profile')
    assert.deepEqual(relation.foreignKey, 'userId')
  }

  @Test()
  public async shouldThrowNotImplementedRelationExceptionIfTryingToIncludeARelationThatIsNotPresentInModel({
    assert
  }: Context) {
    class Profile extends BaseModel {}
    class User extends BaseModel {
      @HasOne(() => Profile)
      public profile: Profile
    }

    const schema = new ModelSchema(User)
    const meta = schema.relations[0]

    assert.throws(() => schema.includeRelation('not-found'), NotImplementedRelationException)
    assert.isFalse(meta.isIncluded)
    assert.deepEqual(meta.type, 'hasOne')
    assert.deepEqual(meta.model(), Profile)
    assert.deepEqual(meta.primaryKey, 'id')
    assert.deepEqual(meta.property, 'profile')
    assert.deepEqual(meta.foreignKey, 'userId')
  }

  @Test()
  @Cleanup(async () => {
    await Database.connection('mongo-memory').dropTable('users')
    await Database.connection('mongo-memory').close()
  })
  public async shouldBeAbleToSyncModelWithMongoDatabase({ assert }: Context) {
    class User extends BaseModel {
      public static connection() {
        return 'mongo-memory'
      }

      @Column({ name: '_id' })
      public id: string

      @Column({ isUnique: true })
      public email: string
    }

    await User.schema().sync()

    const user = await User.create({ email: 'jlenon7@gmail.com' })

    assert.isDefined(user.id)
    assert.isDefined(user.email)

    /**
     * Validate that unique index is working fine.
     */
    await assert.rejects(async () => await User.create({ email: 'jlenon7@gmail.com' }))
  }

  @Test()
  @Cleanup(async () => {
    await Database.connection('mysql-docker').close()
  })
  public async shouldBeAbleToSyncModelWithMySqlDatabase() {
    class User extends BaseModel {
      public static connection() {
        return 'mysql-docker'
      }

      @Column({ name: '_id' })
      public id: string

      @Column({ isUnique: true })
      public email: string
    }

    /**
     * Not implemented yet.
     */
    await User.schema().sync()
  }

  @Test()
  @Cleanup(async () => {
    await Database.connection('postgres-docker').close()
  })
  public async shouldBeAbleToSyncModelWithPostgresDatabase() {
    class User extends BaseModel {
      public static connection() {
        return 'postgres-docker'
      }

      @Column({ name: '_id' })
      public id: string

      @Column({ isUnique: true })
      public email: string
    }

    /**
     * Not implemented yet.
     */
    await User.schema().sync()
  }

  @Cleanup(async () => {
    await Database.connection('sqlite-memory').close()
  })
  public async shouldBeAbleToSyncModelWithSqliteDatabase() {
    class User extends BaseModel {
      public static connection() {
        return 'sqlite-memory'
      }

      @Column({ name: '_id' })
      public id: string

      @Column({ isUnique: true })
      public email: string
    }

    /**
     * Not implemented yet.
     */
    await User.schema().sync()
  }
}
