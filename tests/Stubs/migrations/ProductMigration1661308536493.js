import { Table } from 'typeorm'

export class ProductMigration1661308536493 {
  /**
   * Create a table instance.
   *
   * @return {string}
   */
  static get tableName() {
    return 'products'
  }

  /**
   * Up.
   *
   * @param queryRunner {import('typeorm').QueryRunner}
   * @return {Promise<void>}
   */
  async up(queryRunner) {
    const table = new Table({ name: ProductMigration1661308536493.tableName })

    table.addColumn({
      name: 'id',
      type: 'int',
      isPrimary: true,
      isGenerated: true,
      generationStrategy: 'increment',
    })

    table.addColumn({
      name: 'name',
      type: 'varchar',
    })

    table.addColumn({
      name: 'userId',
      type: 'int',
    })

    table.addColumn({
      name: 'createdAt',
      type: 'timestamp',
      default: 'now()',
    })

    table.addColumn({
      name: 'updatedAt',
      type: 'timestamp',
      default: 'now()',
    })

    table.addColumn({
      name: 'deletedAt',
      type: 'timestamp',
      default: null,
      isNullable: true,
    })

    await queryRunner.createTable(table)
  }

  /**
   * Down.
   *
   * @param queryRunner {import('typeorm').QueryRunner}
   * @return {Promise<void>}
   */
  async down(queryRunner) {
    await queryRunner.dropTable(ProductMigration1661308536493.tableName)
  }
}
