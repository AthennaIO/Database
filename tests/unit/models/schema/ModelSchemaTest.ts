/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Test, type Context } from '@athenna/test'
import { Column } from '#src/models/annotations/Column'
import { ModelSchema } from '#src/models/schemas/ModelSchema'

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
  public async shouldBeAbleToGetTheModelSoftDeleteColumnOptions({ assert }: Context) {
    class User {
      @Column({ isDeleteDate: true })
      public deletedAt: string
    }

    const column = new ModelSchema(User).getSoftDeleteColumn()

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
      property: 'id'
    })
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
}
