/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseModel } from '#src/models/BaseModel'
import { HasOne } from '#src/models/annotations/HasOne'
import { Column } from '#src/models/annotations/Column'
import { Test, type Context, Mock, BeforeEach } from '@athenna/test'
import { ModelGenerator } from '#src/models/factories/ModelGenerator'
import { HasOneRelation } from '#src/models/relations/HasOne/HasOneRelation'

export default class ModelGeneratorTest {
  @BeforeEach()
  public beforeEach() {
    Mock.restoreAll()
  }

  @Test()
  public async shouldBeAbleToGenerateOneInstanceOfModel({ assert }: Context) {
    class User extends BaseModel {
      @Column()
      public id: string
    }

    const data = await new ModelGenerator(User, User.schema()).generateOne({ id: '1' })

    assert.deepEqual(data, { id: '1', original: { id: '1' } })
  }

  @Test()
  public async shouldBeAbleToGenerateOneInstanceOfModelMappingToCorrectColumnName({ assert }: Context) {
    class User extends BaseModel {
      @Column({ name: '_id' })
      public id: string
    }

    const data = await new ModelGenerator(User, User.schema()).generateOne({ _id: '1' })

    assert.deepEqual(data, { id: '1', original: { id: '1' } })
  }

  @Test()
  public async shouldReturnUndefinedWhenTryingToGenerateOneModelWithUndefinedData({ assert }: Context) {
    class User extends BaseModel {
      @Column({ name: '_id' })
      public id: string
    }

    const data = await new ModelGenerator(User, User.schema()).generateOne(undefined)

    assert.isUndefined(data)
  }

  @Test()
  public async shouldBeAbleToGenerateManyInstancesOfModel({ assert }: Context) {
    class User extends BaseModel {
      @Column()
      public id: string
    }

    const data = await new ModelGenerator(User, User.schema()).generateMany([{ id: '1' }])

    assert.deepEqual(data, [{ id: '1', original: { id: '1' } }])
  }

  @Test()
  public async shouldBeAbleToGenerateManyInstancesOfModelMappingToCorrectColumnName({ assert }: Context) {
    class User extends BaseModel {
      @Column({ name: '_id' })
      public id: string
    }

    const data = await new ModelGenerator(User, User.schema()).generateMany([{ _id: '1' }])

    assert.deepEqual(data, [{ id: '1', original: { id: '1' } }])
  }

  @Test()
  public async shouldReturnEmptyArrayWhenTryingToGenerateManyModelWithUndefinedData({ assert }: Context) {
    class User extends BaseModel {
      @Column({ name: '_id' })
      public id: string
    }

    const data = await new ModelGenerator(User, User.schema()).generateMany(undefined)

    assert.isEmpty(data)
  }

  @Test()
  public async shouldReturnEmptyArrayWhenTryingToGenerateManyModelWithEmptyArrayData({ assert }: Context) {
    class User extends BaseModel {
      @Column({ name: '_id' })
      public id: string
    }

    const data = await new ModelGenerator(User, User.schema()).generateMany([])

    assert.isEmpty(data)
  }

  @Test()
  public async shouldBeAbleToGenerateOneModelAndIncludeAHasOneRelation({ assert }: Context) {
    class Profile extends BaseModel {
      @Column()
      public userId: string
    }
    class User extends BaseModel {
      @Column({ name: '_id' })
      public id: string

      @HasOne(() => Profile)
      public profile: Profile
    }
    Mock.when(HasOneRelation, 'load').resolve({
      id: '1',
      profile: { userId: '1' },
      setOriginal: () => ({ id: '1', profile: { userId: '1' } })
    })
    const schema = User.schema()
    schema.relations[0].isIncluded = true

    const data = await new ModelGenerator(User, schema).generateOne({ _id: '1' })

    assert.deepEqual(data, { id: '1', profile: { userId: '1' } })
  }

  @Test()
  public async shouldReturnTheModelIfRelationTypeDoesNotExist({ assert }: Context) {
    class Profile extends BaseModel {
      @Column()
      public userId: string
    }
    class User extends BaseModel {
      @Column({ name: '_id' })
      public id: string

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      @HasOne(Profile)
      public profile: Profile
    }
    Mock.when(HasOneRelation, 'load').resolve({ id: '1', profile: { userId: '1' } })
    const schema = User.schema()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    schema.relations[0].type = 'not-found'

    const data = await new ModelGenerator(User, schema).generateOne({ _id: '1' })

    assert.deepEqual(data, { id: '1', original: { id: '1' } })
  }

  @Test()
  public async shouldBeAbleToGenerateManyModelAndIncludeAHasOneRelation({ assert }: Context) {
    class Profile extends BaseModel {
      @Column()
      public userId: string
    }
    class User extends BaseModel {
      @Column({ name: '_id' })
      public id: string

      @HasOne(() => Profile)
      public profile: Profile
    }
    Mock.when(HasOneRelation, 'loadAll').resolve([
      { id: '1', profile: { userId: '1' }, setOriginal: () => ({ id: '1', profile: { userId: '1' } }) }
    ])
    const schema = User.schema()
    schema.relations[0].isIncluded = true

    const data = await new ModelGenerator(User, schema).generateMany([{ _id: '1' }])

    assert.deepEqual(data, [{ id: '1', profile: { userId: '1' } }])
  }

  @Test()
  public async shouldReturnTheModelsIfRelationTypeDoesNotExist({ assert }: Context) {
    class Profile extends BaseModel {
      @Column()
      public userId: string
    }
    class User extends BaseModel {
      @Column({ name: '_id' })
      public id: string

      @HasOne(() => Profile)
      public profile: Profile
    }
    Mock.when(HasOneRelation, 'loadAll').resolve([{ id: '1', profile: { userId: '1' } }])
    const schema = User.schema()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    schema.relations[0].type = 'not-found'

    const data = await new ModelGenerator(User, schema).generateMany([{ _id: '1' }])

    assert.deepEqual(data, [{ id: '1', original: { id: '1' } }])
  }
}
