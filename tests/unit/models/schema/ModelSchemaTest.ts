/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '#src/models/Model'
import { Test, type Context } from '@athenna/test'
import { HasOne } from '#src/models/annotations/HasOne'
import { Column } from '#src/models/annotations/Column'
import { ModelSchema } from '#src/models/schemas/ModelSchema'
import { NotImplementedRelationException } from '#src/exceptions/NotImplementedRelationException'

export default class ModelSchemaTest {
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
      isPrimary: false,
      isUnique: false,
      isUpdateDate: false,
      name: 'id',
      persist: true,
      property: 'id'
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
      isPrimary: false,
      isUnique: false,
      isUpdateDate: false,
      name: '_id',
      persist: true,
      property: 'id'
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
      public createdAt: string
    }

    const column = new ModelSchema(User).getCreatedAtColumn()

    assert.deepEqual(column, {
      defaultTo: null,
      isCreateDate: true,
      isDeleteDate: false,
      isHidden: false,
      isMainPrimary: false,
      isNullable: true,
      isPrimary: false,
      isUnique: false,
      isUpdateDate: false,
      name: 'createdAt',
      persist: true,
      property: 'createdAt'
    })
  }

  @Test()
  public async shouldBeAbleToGetTheModelUpdatedAtColumnOptions({ assert }: Context) {
    class User {
      @Column({ isUpdateDate: true })
      public updatedAt: string
    }

    const column = new ModelSchema(User).getUpdatedAtColumn()

    assert.deepEqual(column, {
      defaultTo: null,
      isCreateDate: false,
      isDeleteDate: false,
      isHidden: false,
      isMainPrimary: false,
      isNullable: true,
      isPrimary: false,
      isUnique: false,
      isUpdateDate: true,
      name: 'updatedAt',
      persist: true,
      property: 'updatedAt'
    })
  }

  @Test()
  public async shouldBeAbleToGetTheModelDeletedAtColumnOptions({ assert }: Context) {
    class User {
      @Column({ isDeleteDate: true })
      public deletedAt: string
    }

    const column = new ModelSchema(User).getDeletedAtColumn()

    assert.deepEqual(column, {
      defaultTo: null,
      isCreateDate: false,
      isDeleteDate: true,
      isHidden: false,
      isMainPrimary: false,
      isNullable: true,
      isPrimary: false,
      isUnique: false,
      isUpdateDate: false,
      name: 'deletedAt',
      persist: true,
      property: 'deletedAt'
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
      isPrimary: true,
      isUnique: false,
      isUpdateDate: false,
      isMainPrimary: true,
      name: 'id',
      persist: true,
      property: 'id'
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
    class Profile extends Model {}
    class User extends Model {
      @HasOne(Profile)
      public profile: Profile
    }

    const relation = new ModelSchema(User).getRelationByProperty('profile')

    assert.deepEqual(relation, {
      foreignKey: 'userId',
      model: Profile,
      primaryKey: 'id',
      property: 'profile',
      type: 'hasOne',
      isIncluded: false
    })
  }

  @Test()
  public async shouldBeAbleToIncludeAHasOneRelationByClassPropertyName({ assert }: Context) {
    class Profile extends Model {}
    class User extends Model {
      @HasOne(Profile)
      public profile: Profile
    }

    const schema = new ModelSchema(User)
    const relation = schema.includeRelation('profile')

    assert.deepEqual(schema.relations, [
      {
        closure: undefined,
        foreignKey: 'userId',
        model: Profile,
        primaryKey: 'id',
        property: 'profile',
        type: 'hasOne',
        isIncluded: true
      }
    ])
    assert.deepEqual(relation, {
      closure: undefined,
      foreignKey: 'userId',
      model: Profile,
      primaryKey: 'id',
      property: 'profile',
      type: 'hasOne',
      isIncluded: true
    })
  }

  @Test()
  public async shouldThrowNotImplementedRelationExceptionIfTryingToIncludeARelationThatIsNotPresentInModel({
    assert
  }: Context) {
    class Profile extends Model {}
    class User extends Model {
      @HasOne(Profile)
      public profile: Profile
    }

    const schema = new ModelSchema(User)

    assert.throws(() => schema.includeRelation('not-found'), NotImplementedRelationException)
    assert.deepEqual(schema.relations, [
      {
        foreignKey: 'userId',
        model: Profile,
        primaryKey: 'id',
        property: 'profile',
        type: 'hasOne',
        isIncluded: false
      }
    ])
  }
}
