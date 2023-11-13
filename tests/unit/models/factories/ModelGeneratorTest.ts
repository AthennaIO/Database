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
import { Column } from '#src/models/annotations/Column'
import { ModelGenerator } from '#src/models/factories/ModelGenerator'

export default class ModelGeneratorTest {
  @Test()
  public async shouldBeAbleToGenerateOneInstanceOfModel({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string
    }

    const data = await new ModelGenerator(User).generateOne({ id: '1' })

    assert.deepEqual(data, { id: '1' })
  }

  @Test()
  public async shouldBeAbleToGenerateOneInstanceOfModelMappingToCorrectColumnName({ assert }: Context) {
    class User extends Model {
      @Column({ name: '_id' })
      public id: string
    }

    const data = await new ModelGenerator(User).generateOne({ _id: '1' })

    assert.deepEqual(data, { id: '1' })
  }

  @Test()
  public async shouldReturnUndefinedWhenTryingToGenerateOneModelWithUndefinedData({ assert }: Context) {
    class User extends Model {
      @Column({ name: '_id' })
      public id: string
    }

    const data = await new ModelGenerator(User).generateOne(undefined)

    assert.isUndefined(data)
  }

  @Test()
  public async shouldBeAbleToGenerateManyInstancesOfModel({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string
    }

    const data = await new ModelGenerator(User).generateMany([{ id: '1' }])

    assert.deepEqual(data, [{ id: '1' }])
  }

  @Test()
  public async shouldBeAbleToGenerateManyInstancesOfModelMappingToCorrectColumnName({ assert }: Context) {
    class User extends Model {
      @Column({ name: '_id' })
      public id: string
    }

    const data = await new ModelGenerator(User).generateMany([{ _id: '1' }])

    assert.deepEqual(data, [{ id: '1' }])
  }

  @Test()
  public async shouldReturnEmptyArrayWhenTryingToGenerateManyModelWithUndefinedData({ assert }: Context) {
    class User extends Model {
      @Column({ name: '_id' })
      public id: string
    }

    const data = await new ModelGenerator(User).generateMany(undefined)

    assert.isEmpty(data)
  }

  @Test()
  public async shouldReturnEmptyArrayWhenTryingToGenerateManyModelWithEmptyArrayData({ assert }: Context) {
    class User extends Model {
      @Column({ name: '_id' })
      public id: string
    }

    const data = await new ModelGenerator(User).generateMany([])

    assert.isEmpty(data)
  }
}
