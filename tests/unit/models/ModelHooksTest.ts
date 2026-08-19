/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { Database } from '#src/facades/Database'
import { BaseModel } from '#src/models/BaseModel'
import { Annotation } from '#src/helpers/Annotation'
import { UserHooked } from '#tests/fixtures/models/UserHooked'
import { DatabaseProvider } from '#src/providers/DatabaseProvider'
import { BeforeCreate } from '#src/models/annotations/Hooks'
import { ModelQueryBuilder } from '#src/models/builders/ModelQueryBuilder'
import { Test, type Context, BeforeEach, AfterEach, Mock } from '@athenna/test'

export default class ModelHooksTest {
  @BeforeEach()
  public async beforeEach() {
    new DatabaseProvider().register()
    await Config.loadAll(Path.fixtures('config'))
    Database.connection('fake')
    UserHooked.events = []
  }

  @AfterEach()
  public afterEach() {
    Config.clear()
    ioc.reconstruct()
    Mock.restoreAll()
    BaseModel.setAttributes(true).uniqueValidation(true).nullableValidation(true)
  }

  private eventTypes() {
    return UserHooked.events.map(event => event.type)
  }

  @Test()
  public async shouldRegisterHooksMetadataForAllTenAnnotations({ assert }: Context) {
    const hooks = Annotation.getHooksMeta(UserHooked)

    assert.lengthOf(hooks, 10)
    assert.deepEqual(
      hooks.map(h => h.type),
      [
        'beforeCreate',
        'afterCreate',
        'beforeUpdate',
        'afterUpdate',
        'beforeSave',
        'afterSave',
        'beforeDelete',
        'afterDelete',
        'beforeFind',
        'afterFind'
      ]
    )
  }

  @Test()
  public async shouldInheritHooksMetadataFromParentModelsParentFirst({ assert }: Context) {
    class SubUserHooked extends UserHooked {
      @BeforeCreate()
      public static subBeforeCreateHook() {}
    }

    const hooks = Annotation.getHooksMeta(SubUserHooked)

    assert.lengthOf(hooks, 11)
    assert.deepEqual(hooks[0].type, 'beforeCreate')
    assert.deepEqual(hooks[10].method, SubUserHooked.subBeforeCreateHook)

    /**
     * Child hooks must never leak into the parent metadata.
     */
    assert.lengthOf(Annotation.getHooksMeta(UserHooked), 10)
  }

  @Test()
  public async shouldFireCreateHooksInOrderWhenCreatingByStaticMethod({ assert }: Context) {
    Mock.when(Database.driver, 'createMany').resolve([{ id: '1', name: 'lenon' }])

    const data = { name: 'lenon' }
    const user = await UserHooked.create(data)

    assert.deepEqual(this.eventTypes(), ['beforeSave', 'beforeCreate', 'afterCreate', 'afterSave'])
    assert.deepEqual(UserHooked.events[0].payload, data)
    assert.instanceOf(UserHooked.events[2].payload, UserHooked)
    assert.deepEqual(UserHooked.events[2].payload, user)
  }

  @Test()
  public async shouldFireCreateHooksPerItemWhenCreatingMany({ assert }: Context) {
    Mock.when(Database.driver, 'createMany').resolve([{ id: '1' }, { id: '2' }])

    await UserHooked.createMany([{ name: 'lenon' }, { name: 'txsoura' }])

    assert.deepEqual(this.eventTypes(), [
      'beforeSave',
      'beforeCreate',
      'beforeSave',
      'beforeCreate',
      'afterCreate',
      'afterSave',
      'afterCreate',
      'afterSave'
    ])
  }

  @Test()
  public async shouldAllowBeforeCreateHooksToMutateTheDataBeforePersisting({ assert }: Context) {
    class MutatingUserHooked extends UserHooked {
      @BeforeCreate()
      public static mutateHook(data: any) {
        data.name = 'mutated'
      }
    }

    Mock.when(Database.driver, 'createMany').resolve([{ id: '1', name: 'mutated' }])

    await MutatingUserHooked.create({ name: 'original' })

    const persisted = (Database.driver.createMany as any).getCall(0).args[0]

    assert.deepEqual(persisted[0].name, 'mutated')
  }

  @Test()
  public async shouldFireUpdateHooksInOrderWhenUpdatingByStaticMethod({ assert }: Context) {
    Mock.when(Database.driver, 'update').resolve({ id: '1', name: 'lenon' })

    const data = { name: 'lenon' }
    const user = await UserHooked.update({ id: '1' }, data)

    assert.deepEqual(this.eventTypes(), ['beforeSave', 'beforeUpdate', 'afterUpdate', 'afterSave'])
    assert.deepEqual(UserHooked.events[0].payload, data)
    assert.instanceOf(UserHooked.events[2].payload, UserHooked)
    assert.deepEqual(UserHooked.events[2].payload, user)
  }

  @Test()
  public async shouldFireAfterUpdateHooksPerModelWhenUpdateReturnsMany({ assert }: Context) {
    Mock.when(Database.driver, 'update').resolve([{ id: '1' }, { id: '2' }])

    await UserHooked.update({}, { name: 'lenon' })

    assert.deepEqual(this.eventTypes(), [
      'beforeSave',
      'beforeUpdate',
      'afterUpdate',
      'afterSave',
      'afterUpdate',
      'afterSave'
    ])
  }

  @Test()
  public async shouldFireFindHooksWhenFindingOneValue({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve({ id: '1', name: 'lenon' })

    const user = await UserHooked.find()

    assert.deepEqual(this.eventTypes(), ['beforeFind', 'afterFind'])
    assert.instanceOf(UserHooked.events[0].payload, ModelQueryBuilder)
    assert.deepEqual(UserHooked.events[1].payload, user)
  }

  @Test()
  public async shouldNotFireAfterFindHookWhenNothingIsFound({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)

    await UserHooked.find()

    assert.deepEqual(this.eventTypes(), ['beforeFind'])
  }

  @Test()
  public async shouldFireAfterFindHooksPerModelWhenFindingManyValues({ assert }: Context) {
    Mock.when(Database.driver, 'findMany').resolve([{ id: '1' }, { id: '2' }])

    await UserHooked.findMany()

    assert.deepEqual(this.eventTypes(), ['beforeFind', 'afterFind', 'afterFind'])
  }

  @Test()
  public async shouldFireFindHooksWhenPaginating({ assert }: Context) {
    Mock.when(Database.driver, 'paginate').resolve({
      data: [{ id: '1' }],
      meta: {},
      links: {}
    })

    await UserHooked.paginate()

    assert.deepEqual(this.eventTypes(), ['beforeFind', 'afterFind'])
  }

  @Test()
  public async shouldFireCreateHooksOnceWithTheInstanceWhenSavingANewModel({ assert }: Context) {
    Mock.when(Database.driver, 'createMany').resolve([{ id: '1', name: 'lenon' }])

    const user = new UserHooked()

    user.name = 'lenon'

    await user.save()

    assert.deepEqual(this.eventTypes(), ['beforeSave', 'beforeCreate', 'afterCreate', 'afterSave'])
    UserHooked.events.forEach(event => assert.deepEqual(event.payload, user))
  }

  @Test()
  public async shouldFireUpdateHooksOnceWithTheInstanceWhenSavingAPersistedModel({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve({ id: '1', name: 'lenon' })

    const user = await UserHooked.find()

    UserHooked.events = []
    Mock.when(Database.driver, 'update').resolve({ id: '1', name: 'txsoura' })

    user.name = 'txsoura'

    await user.save()

    assert.deepEqual(this.eventTypes(), ['beforeSave', 'beforeUpdate', 'afterUpdate', 'afterSave'])
    UserHooked.events.forEach(event => assert.deepEqual(event.payload, user))
  }

  @Test()
  public async shouldNotFireAfterHooksWhenSavingAPersistedModelWithoutChanges({ assert }: Context) {
    const date = new Date()

    Mock.when(Database.driver, 'find').resolve({
      id: '1',
      name: 'lenon',
      created_at: date,
      updated_at: date,
      deleted_at: null
    })

    const user = await UserHooked.find()

    UserHooked.events = []
    Mock.when(Database.driver, 'update').resolve({ id: '1', name: 'lenon' })

    await user.save()

    assert.deepEqual(this.eventTypes(), ['beforeSave', 'beforeUpdate'])
    assert.notCalled(Database.driver.update)
  }

  @Test()
  public async shouldFireDeleteHooksWithTheInstanceWhenDeletingAModel({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve({ id: '1', name: 'lenon' })

    const user = await UserHooked.find()

    UserHooked.events = []
    Mock.when(Database.driver, 'update').resolve({ id: '1' })

    await user.delete()

    /**
     * A soft delete runs an update query, but must fire only the
     * delete hooks, never the save/update ones.
     */
    assert.deepEqual(this.eventTypes(), ['beforeDelete', 'afterDelete'])
    UserHooked.events.forEach(event => assert.deepEqual(event.payload, user))
    assert.calledOnce(Database.driver.update)
  }

  @Test()
  public async shouldFireDeleteHooksWhenForceDeletingAModel({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve({ id: '1', name: 'lenon' })

    const user = await UserHooked.find()

    UserHooked.events = []
    Mock.when(Database.driver, 'delete').resolve(undefined)

    await user.delete(true)

    assert.deepEqual(this.eventTypes(), ['beforeDelete', 'afterDelete'])
    assert.calledOnce(Database.driver.delete)
  }

  @Test()
  public async shouldNotFireHooksOnQueryDeletes({ assert }: Context) {
    Mock.when(Database.driver, 'update').resolve({ id: '1' })

    await UserHooked.query().where('id', '1').delete()

    assert.deepEqual(this.eventTypes(), [])
  }

  @Test()
  public async shouldNotFireHooksWhenUsingWithoutHooks({ assert }: Context) {
    Mock.when(Database.driver, 'createMany').resolve([{ id: '1' }])
    Mock.when(Database.driver, 'find').resolve({ id: '1' })

    await UserHooked.query().withoutHooks().create({ name: 'lenon' })
    await UserHooked.query().withoutHooks().find()

    assert.deepEqual(this.eventTypes(), [])
  }

  @Test()
  public async shouldFireInheritedHooksWhenPersistingChildModels({ assert }: Context) {
    class SubUserHooked extends UserHooked {}

    Mock.when(Database.driver, 'createMany').resolve([{ id: '1' }])

    await SubUserHooked.create({ name: 'lenon' })

    assert.deepEqual(this.eventTypes(), ['beforeSave', 'beforeCreate', 'afterCreate', 'afterSave'])
  }

  @Test()
  public async shouldSupportAsyncHookMethods({ assert }: Context) {
    class AsyncUserHooked extends UserHooked {
      @BeforeCreate()
      public static async asyncHook(data: any) {
        await new Promise(resolve => setTimeout(resolve, 1))

        data.name = 'async'
      }
    }

    Mock.when(Database.driver, 'createMany').resolve([{ id: '1', name: 'async' }])

    await AsyncUserHooked.create({ name: 'original' })

    const persisted = (Database.driver.createMany as any).getCall(0).args[0]

    assert.deepEqual(persisted[0].name, 'async')
  }
}
