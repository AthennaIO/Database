import { Table } from 'typeorm'

export class UserMigration1661308536492 {
  /**
   * Create a table instance.
   *
   * @return {Table}
   */
  tableName = 'users'

  /**
   * Up.
   *
   * @param queryRunner {import('typeorm').QueryRunner}
   * @return {Promise<void>}
   */
  async up(queryRunner) {
    const table = new Table({ name: this.tableName })

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
      name: 'email',
      type: 'varchar',
      isUnique: true,
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
    await queryRunner.dropTable(this.tableName)
  }
}
