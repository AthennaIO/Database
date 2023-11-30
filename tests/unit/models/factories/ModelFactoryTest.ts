/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '#src/models/Model'
import { Column } from '#src/models/annotations/Column'
import { Test, type Context, Mock, BeforeEach } from '@athenna/test'

export default class ModelFactoryTest {
  @BeforeEach()
  public beforeEach() {
    Mock.restoreAll()
  }

  @Test()
  public async shouldBeAbleToMakeOneInstanceOfModelReturningTheFullInstance({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string
    }

    const data = await User.factory().count(1).make({ id: '1' })

    assert.deepEqual(data, { id: '1' })
  }

  @Test()
  public async shouldBeAbleToMakeOneInstanceOfModelReturningTheIdValueOnly({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string
    }

    const data = await User.factory().returning('id').count(1).make({ id: '1' })

    assert.deepEqual(data, '1')
  }

  @Test()
  public async shouldBeAbleToMakeOneTrashedInstanceOfModelReturningTheFullInstance({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string

      @Column({ isDeleteDate: true })
      public deletedAt: Date
    }

    const data = await User.factory().count(1).trashed().make({ id: '1' })

    assert.deepEqual(data.id, '1')
    assert.isDefined(data.deletedAt)
  }

  @Test()
  public async shouldBeAbleToMakeOneUntrashedInstanceOfModelReturningTheFullInstance({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string

      @Column({ isDeleteDate: true })
      public deletedAt: Date
    }

    const data = await User.factory().count(1).trashed().untrashed().make({ id: '1' })

    assert.deepEqual(data.id, '1')
    assert.isUndefined(data.deletedAt)
  }

  @Test()
  public async shouldBeAbleToMakeOneInstanceOfModelReturningTheFullInstanceWithTrashedEvenIfModelDontHaveDeleteDateColumn({
    assert
  }: Context) {
    class User extends Model {
      @Column()
      public id: string

      // only for types
      public deletedAt: string
    }

    const data = await User.factory().count(1).trashed().make({ id: '1' })

    assert.deepEqual(data.id, '1')
    assert.isUndefined(data.deletedAt)
  }

  @Test()
  public async shouldBeAbleToMakeOneTrashedInstanceOfModelReturningTheIdValueOnly({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string

      @Column({ isDeleteDate: true })
      public deletedAt: Date
    }

    const data = await User.factory().returning('id').trashed().count(1).make({ id: '1' })

    assert.deepEqual(data, '1')
  }

  @Test()
  public async shouldBeAbleToMakeOneInstanceOfModelReturningTheIdValueOnlyWithTrashedEvenIfModelDontHaveDeleteDateColumn({
    assert
  }: Context) {
    class User extends Model {
      @Column()
      public id: string

      // only for types
      public deletedAt: string
    }

    const data = await User.factory().count(1).returning('id').trashed().make({ id: '1' })

    assert.deepEqual(data, '1')
  }

  @Test()
  public async shouldBeAbleToMakeOneInstanceOfModelUsingDefinitionModelMethod({ assert }: Context) {
    class User extends Model {
      public static async definition(): Promise<Partial<User>> {
        return {
          id: '1'
        }
      }

      @Column()
      public id: string
    }

    const data = await User.factory().count(1).make()

    assert.deepEqual(data, { id: '1' })
  }

  @Test()
  public async shouldBeAbleToMakeOneInstancesOfModelSettingAnotherModelFactoryUsingDefinitionModelMethod({
    assert
  }: Context) {
    class Product extends Model {
      public static async definition(): Promise<Partial<Product>> {
        return {
          id: '1'
        }
      }

      @Column()
      public id: string
    }

    class User extends Model {
      public static async definition(): Promise<Partial<User>> {
        return {
          id: '1',
          productId: Product.factory().returningAs('id')
        }
      }

      @Column()
      public id: string

      @Column()
      public productId: string
    }

    const data = await User.factory().count(1).make()

    assert.deepEqual(data, { id: '1', productId: '1' })
  }

  @Test()
  public async shouldBeAbleToMakeManyInstancesOfModelReturningTheFullInstance({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string
    }

    const data = await User.factory().count(2).make({ id: '1' })

    assert.deepEqual(data, [{ id: '1' }, { id: '1' }])
  }

  @Test()
  public async shouldBeAbleToMakeManyInstancesOfModelReturningTheIdValueOnly({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string
    }

    const data = await User.factory().returning('id').count(2).make({ id: '1' })

    assert.deepEqual(data, ['1', '1'])
  }

  @Test()
  public async shouldBeAbleToMakeManyTrashedInstanceOfModelReturningTheFullInstance({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string

      @Column({ isDeleteDate: true })
      public deletedAt: Date
    }

    const data = await User.factory().count(2).trashed().make({ id: '1' })

    assert.deepEqual(data[0].id, '1')
    assert.isDefined(data[0].deletedAt)
    assert.deepEqual(data[1].id, '1')
    assert.isDefined(data[1].deletedAt)
  }

  @Test()
  public async shouldBeAbleToMakeManyUntrashedInstanceOfModelReturningTheFullInstance({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string

      @Column({ isDeleteDate: true })
      public deletedAt: Date
    }

    const data = await User.factory().count(2).trashed().untrashed().make({ id: '1' })

    assert.deepEqual(data[0].id, '1')
    assert.isUndefined(data[0].deletedAt)
  }

  @Test()
  public async shouldBeAbleToMakeManyInstanceOfModelReturningTheFullInstanceWithTrashedEvenIfModelDontHaveDeleteDateColumn({
    assert
  }: Context) {
    class User extends Model {
      @Column()
      public id: string

      // only for types
      public deletedAt: string
    }

    const data = await User.factory().count(2).trashed().make({ id: '1' })

    assert.deepEqual(data[0].id, '1')
    assert.isUndefined(data[0].deletedAt)
    assert.deepEqual(data[1].id, '1')
    assert.isUndefined(data[1].deletedAt)
  }

  @Test()
  public async shouldBeAbleToMakeManyTrashedInstanceOfModelReturningTheIdValueOnly({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string

      @Column({ isDeleteDate: true })
      public deletedAt: Date
    }

    const data = await User.factory().returning('id').trashed().count(2).make({ id: '1' })

    assert.deepEqual(data, ['1', '1'])
  }

  @Test()
  public async shouldBeAbleToMakeManyInstanceOfModelReturningTheIdValueOnlyWithTrashedEvenIfModelDontHaveDeleteDateColumn({
    assert
  }: Context) {
    class User extends Model {
      @Column()
      public id: string

      // only for types
      public deletedAt: string
    }

    const data = await User.factory().count(2).returning('id').trashed().make({ id: '1' })

    assert.deepEqual(data, ['1', '1'])
  }

  @Test()
  public async shouldBeAbleToMakeManyInstancesOfModelUsingDefinitionModelMethod({ assert }: Context) {
    class User extends Model {
      public static async definition(): Promise<Partial<User>> {
        return {
          id: '1'
        }
      }

      @Column()
      public id: string
    }

    const data = await User.factory().count(2).make()

    assert.deepEqual(data, [{ id: '1' }, { id: '1' }])
  }

  @Test()
  public async shouldBeAbleToMakeManyInstancesOfModelSettingAnotherModelFactoryUsingDefinitionModelMethod({
    assert
  }: Context) {
    class Product extends Model {
      public static async definition(): Promise<Partial<Product>> {
        return {
          id: '1'
        }
      }

      @Column()
      public id: string
    }

    class User extends Model {
      public static async definition(): Promise<Partial<User>> {
        return {
          id: '1',
          productId: Product.factory().returningAs('id')
        }
      }

      @Column()
      public id: string

      @Column()
      public productId: string
    }

    const data = await User.factory().count(2).make()

    assert.deepEqual(data, [
      { id: '1', productId: '1' },
      { id: '1', productId: '1' }
    ])
  }

  @Test()
  public async shouldBeAbleToCreateOneInstanceOfModelReturningTheFullInstance({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string
    }

    Mock.when(User, 'createMany').resolve([{ id: '1' }])

    const data = await User.factory().count(1).create({ id: '1' })

    assert.deepEqual(data, { id: '1' })
  }

  @Test()
  public async shouldBeAbleToCreateOneInstanceOfModelReturningTheIdValueOnly({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string
    }

    Mock.when(User, 'createMany').resolve([{ id: '1' }])

    const data = await User.factory().returning('id').count(1).create({ id: '1' })

    assert.deepEqual(data, '1')
  }

  @Test()
  public async shouldBeAbleToCreateOneTrashedInstanceOfModelReturningTheFullInstance({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string

      @Column({ isDeleteDate: true })
      public deletedAt: Date
    }

    Mock.when(User, 'createMany').resolve([{ id: '1', deletedAt: new Date() }])

    const data = await User.factory().count(1).trashed().create({ id: '1' })

    assert.deepEqual(data.id, '1')
    assert.isDefined(data.deletedAt)
  }

  @Test()
  public async shouldBeAbleToCreateOneUntrashedInstanceOfModelReturningTheFullInstance({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string

      @Column({ isDeleteDate: true })
      public deletedAt: Date
    }

    Mock.when(User, 'createMany').resolve([{ id: '1' }])

    const data = await User.factory().count(1).trashed().untrashed().create({ id: '1' })

    assert.deepEqual(data.id, '1')
    assert.isUndefined(data.deletedAt)
  }

  @Test()
  public async shouldBeAbleToCreateOneInstanceOfModelReturningTheFullInstanceWithTrashedEvenIfModelDontHaveDeleteDateColumn({
    assert
  }: Context) {
    class User extends Model {
      @Column()
      public id: string

      // only for types
      public deletedAt: string
    }

    Mock.when(User, 'createMany').resolve([{ id: '1' }])

    const data = await User.factory().count(1).trashed().create({ id: '1' })

    assert.deepEqual(data.id, '1')
    assert.isUndefined(data.deletedAt)
  }

  @Test()
  public async shouldBeAbleToCreateOneTrashedInstanceOfModelReturningTheIdValueOnly({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string

      @Column({ isDeleteDate: true })
      public deletedAt: Date
    }

    Mock.when(User, 'createMany').resolve([{ id: '1', deletedAt: new Date() }])

    const data = await User.factory().returning('id').trashed().count(1).create({ id: '1' })

    assert.deepEqual(data, '1')
  }

  @Test()
  public async shouldBeAbleToCreateOneInstanceOfModelReturningTheIdValueOnlyWithTrashedEvenIfModelDontHaveDeleteDateColumn({
    assert
  }: Context) {
    class User extends Model {
      @Column()
      public id: string

      // only for types
      public deletedAt: string
    }

    Mock.when(User, 'createMany').resolve([{ id: '1' }])

    const data = await User.factory().count(1).returning('id').trashed().create({ id: '1' })

    assert.deepEqual(data, '1')
  }

  @Test()
  public async shouldBeAbleToCreateOneInstanceOfModelUsingDefinitionModelMethod({ assert }: Context) {
    class User extends Model {
      public static async definition(): Promise<Partial<User>> {
        return {
          id: '1'
        }
      }

      @Column()
      public id: string
    }

    Mock.when(User, 'createMany').resolve([{ id: '1' }])

    const data = await User.factory().count(1).create()

    assert.deepEqual(data, { id: '1' })
  }

  @Test()
  public async shouldBeAbleToCreateOneInstancesOfModelSettingAnotherModelFactoryUsingDefinitionModelMethod({
    assert
  }: Context) {
    class Product extends Model {
      public static async definition(): Promise<Partial<Product>> {
        return {
          id: '1'
        }
      }

      @Column()
      public id: string
    }

    class User extends Model {
      public static async definition(): Promise<Partial<User>> {
        return {
          id: '1',
          productId: Product.factory().returningAs('id')
        }
      }

      @Column()
      public id: string

      @Column()
      public productId: string
    }

    Mock.when(Product, 'createMany').resolve([{ id: '1' }])
    Mock.when(User, 'createMany').resolve([{ id: '1', productId: '1' }])

    const data = await User.factory().count(1).create()

    assert.deepEqual(data, { id: '1', productId: '1' })
  }

  @Test()
  public async shouldBeAbleToCreateManyInstancesOfModelReturningTheFullInstance({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string
    }

    Mock.when(User, 'createMany').resolve([{ id: '1' }, { id: '1' }])

    const data = await User.factory().count(2).create({ id: '1' })

    assert.deepEqual(data, [{ id: '1' }, { id: '1' }])
  }

  @Test()
  public async shouldBeAbleToCreateManyInstancesOfModelReturningTheIdValueOnly({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string
    }

    Mock.when(User, 'createMany').resolve([{ id: '1' }, { id: '1' }])

    const data = await User.factory().returning('id').count(2).create({ id: '1' })

    assert.deepEqual(data, ['1', '1'])
  }

  @Test()
  public async shouldBeAbleToCreateManyTrashedInstanceOfModelReturningTheFullInstance({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string

      @Column({ isDeleteDate: true })
      public deletedAt: Date
    }

    Mock.when(User, 'createMany').resolve([
      { id: '1', deletedAt: new Date() },
      { id: '1', deletedAt: new Date() }
    ])

    const data = await User.factory().count(2).trashed().create({ id: '1' })

    assert.deepEqual(data[0].id, '1')
    assert.isDefined(data[0].deletedAt)
    assert.deepEqual(data[1].id, '1')
    assert.isDefined(data[1].deletedAt)
  }

  @Test()
  public async shouldBeAbleToCreateManyUntrashedInstanceOfModelReturningTheFullInstance({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string

      @Column({ isDeleteDate: true })
      public deletedAt: Date
    }

    Mock.when(User, 'createMany').resolve([{ id: '1' }, { id: '1' }])

    const data = await User.factory().count(2).trashed().untrashed().create({ id: '1' })

    assert.deepEqual(data[0].id, '1')
    assert.isUndefined(data[0].deletedAt)
  }

  @Test()
  public async shouldBeAbleToCreateManyInstanceOfModelReturningTheFullInstanceWithTrashedEvenIfModelDontHaveDeleteDateColumn({
    assert
  }: Context) {
    class User extends Model {
      @Column()
      public id: string

      // only for types
      public deletedAt: string
    }

    Mock.when(User, 'createMany').resolve([{ id: '1' }, { id: '1' }])

    const data = await User.factory().count(2).trashed().create({ id: '1' })

    assert.deepEqual(data[0].id, '1')
    assert.isUndefined(data[0].deletedAt)
    assert.deepEqual(data[1].id, '1')
    assert.isUndefined(data[1].deletedAt)
  }

  @Test()
  public async shouldBeAbleToCreateManyTrashedInstanceOfModelReturningTheIdValueOnly({ assert }: Context) {
    class User extends Model {
      @Column()
      public id: string

      @Column({ isDeleteDate: true })
      public deletedAt: Date
    }

    Mock.when(User, 'createMany').resolve([
      { id: '1', deletedAt: new Date() },
      { id: '1', deletedAt: new Date() }
    ])

    const data = await User.factory().returning('id').trashed().count(2).create({ id: '1' })

    assert.deepEqual(data, ['1', '1'])
  }

  @Test()
  public async shouldBeAbleToCreateManyInstanceOfModelReturningTheIdValueOnlyWithTrashedEvenIfModelDontHaveDeleteDateColumn({
    assert
  }: Context) {
    class User extends Model {
      @Column()
      public id: string

      // only for types
      public deletedAt: string
    }

    Mock.when(User, 'createMany').resolve([{ id: '1' }, { id: '1' }])

    const data = await User.factory().count(2).returning('id').trashed().create({ id: '1' })

    assert.deepEqual(data, ['1', '1'])
  }

  @Test()
  public async shouldBeAbleToCreateManyInstancesOfModelUsingDefinitionModelMethod({ assert }: Context) {
    class User extends Model {
      public static async definition(): Promise<Partial<User>> {
        return {
          id: '1'
        }
      }

      @Column()
      public id: string
    }

    Mock.when(User, 'createMany').resolve([{ id: '1' }, { id: '1' }])

    const data = await User.factory().count(2).create()

    assert.deepEqual(data, [{ id: '1' }, { id: '1' }])
  }

  @Test()
  public async shouldBeAbleToCreateManyInstancesOfModelSettingAnotherModelFactoryUsingDefinitionModelMethod({
    assert
  }: Context) {
    class Product extends Model {
      public static async definition(): Promise<Partial<Product>> {
        return {
          id: '1'
        }
      }

      @Column()
      public id: string
    }

    class User extends Model {
      public static async definition(): Promise<Partial<User>> {
        return {
          id: '1',
          productId: Product.factory().returningAs('id')
        }
      }

      @Column()
      public id: string

      @Column()
      public productId: string
    }

    Mock.when(Product, 'createMany').resolve([{ id: '1' }])
    Mock.when(User, 'createMany').resolve([
      { id: '1', productId: '1' },
      { id: '1', productId: '1' }
    ])

    const data = await User.factory().count(2).create()

    assert.deepEqual(data, [
      { id: '1', productId: '1' },
      { id: '1', productId: '1' }
    ])
  }
}
