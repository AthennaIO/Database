import { DatabaseImpl, Migration } from '#src'

export class ProductDetailsMigration extends Migration {
  public static connection() {
    return 'mysql-docker'
  }

  public tableName = 'product_details'

  public async up(db: DatabaseImpl) {
    return db.createTable(this.tableName, table => {
      table.increments('id')
      table.string('content', 255)
      table.integer('productId').unsigned().index().references('id').inTable('products')

      table.timestamps(true, true, true)
      table.dateTime('deletedAt').nullable().defaultTo(null)
    })
  }

  public async down(db: DatabaseImpl) {
    return db.dropTable(this.tableName)
  }
}
