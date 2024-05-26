/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { sep } from 'node:path'
import { Json, Path, String } from '@athenna/common'
import { BaseCommand, Option, Argument, Generator } from '@athenna/artisan'

export class MakeCrudCommand extends BaseCommand {
  @Argument({
    description: 'The crud name.'
  })
  public name: string

  public namePascal: string
  public nameLower: string

  @Option({
    default: false,
    signature: '--is-mongo',
    description:
      'Define if CRUD will use Mongo as database. Migration will be skipped and "id" will be defined as string.'
  })
  public isMongo: boolean

  public properties: any[] = []

  public static signature(): string {
    return 'make:crud'
  }

  public static description(): string {
    return 'Make a new CRUD in your application.'
  }

  public cleanGenerator() {
    this.generator = new Generator()
  }

  public toCase(value: string) {
    const fileCase = Config.get(
      'rc.commands.make:crud.fileCase',
      'toPascalCase'
    )

    return String[fileCase](value)
  }

  public async handle() {
    this.logger.simple('({bold,green} [ MAKING CRUD ])\n')

    this.namePascal = String.toPascalCase(this.name)
    this.nameLower = this.name.toLowerCase()

    const addId = await this.prompt.confirm(
      `Do you want to add the ${this.paint.yellow('"id"')} property?`
    )

    if (addId) {
      this.properties.push({ name: 'id', type: 'increments', custom: false })
    }

    const addTimestamps = await this.prompt.confirm(
      `Does your CRUD need ${this.paint.yellow(
        '"createdAt/updateAt"'
      )} properties?`
    )

    const addSoftDelete = await this.prompt.confirm(
      `Does your CRUD needs ${this.paint.yellow(
        '"deletedAt"'
      )} property? (Soft Delete)`
    )

    let addMoreProps = await this.prompt.confirm(
      'Do you want to add more properties to your CRUD?'
    )

    while (addMoreProps) {
      const name = await this.prompt.input(
        'What will be the name of your property?'
      )

      const type = await this.prompt.list(
        'What will be the type of your property?',
        ['string', 'number', 'boolean', 'Date']
      )
      const options = await this.prompt.checkbox(
        'Select the options that fits your property:',
        [
          'isPrimary',
          'isUnique',
          'isHidden',
          'notNullable',
          'isIndex',
          'isSparse'
        ]
      )

      const optionsObj = {}

      options.forEach(option => (optionsObj[option] = true))

      this.properties.push({ name, type, custom: true, ...optionsObj })

      addMoreProps = await this.prompt.confirm(
        'Do you want to add more properties?'
      )
    }

    if (addTimestamps) {
      this.properties.push({
        name: 'createdAt',
        type: 'Date',
        custom: false,
        isCreateDate: true
      })

      this.properties.push({
        name: 'updatedAt',
        type: 'Date',
        custom: false,
        isUpdateDate: true
      })
    }

    if (addSoftDelete) {
      this.properties.push({
        name: 'deletedAt',
        type: 'Date',
        custom: false,
        isDeleteDate: true
      })
    }

    console.log()
    const task = this.logger.task()

    if (Config.get('rc.commands.make:crud.model.enabled', true)) {
      task.addPromise('Creating model', () => this.makeModel())
    }

    if (
      !this.isMongo &&
      Config.get('rc.commands.make:crud.migration.enabled', true)
    ) {
      task.addPromise('Creating migration', () => this.makeMigration())
    }

    if (Config.get('rc.commands.make:crud.controller.enabled', true)) {
      task.addPromise('Creating controller', () => this.makeController())
    }

    if (Config.get('rc.commands.make:crud.service.enabled', true)) {
      task.addPromise('Creating service', () => this.makeService())
    }

    if (Config.get('rc.commands.make:crud.controller-test.enabled', true)) {
      task.addPromise('Creating e2e tests for controller', () =>
        this.makeControllerTest()
      )
    }

    if (Config.get('rc.commands.make:crud.service-test.enabled', true)) {
      task.addPromise('Creating unitary tests for service', () =>
        this.makeServiceTest()
      )
    }

    await task.run()

    console.log()
    this.logger.success(`CRUD ({yellow} "${this.name}") successfully created.`)
  }

  public async makeModel() {
    this.cleanGenerator()

    const destination = Config.get(
      'rc.commands.make:crud.model.destination',
      Path.models()
    )

    let properties = ''
    let definitions = ''

    this.properties.forEach((p, i) => {
      const property = Json.copy(p)
      let annotationProps = ''

      if (property.isPrimary) {
        annotationProps += 'isPrimary: true, '
      }

      if (property.isUnique) {
        annotationProps += 'isUnique: true, '
      }

      if (property.isHidden) {
        annotationProps += 'isHidden: true, '
      }

      if (property.notNullable) {
        annotationProps += 'isNullable: false, '
      }

      if (property.isIndex) {
        annotationProps += 'isIndex: true, '
      }

      if (property.isSparse) {
        annotationProps += 'isSparse: true, '
      }

      if (property.isCreateDate) {
        annotationProps += 'isCreateDate: true, '
      }

      if (property.isUpdateDate) {
        annotationProps += 'isUpdateDate: true, '
      }

      if (property.isDeleteDate) {
        annotationProps += 'isDeleteDate: true, '
      }

      if (property.type === 'increments') {
        property.type = this.isMongo ? 'string' : 'number'
      }

      if (annotationProps.length) {
        properties += `  @Column({ ${annotationProps.slice(
          0,
          annotationProps.length - 2
        )} })\n  public ${property.name}: ${property.type}`
      } else {
        properties += `  @Column()\n  public ${property.name}: ${property.type}`
      }

      const type = {
        string: 'this.faker.string.sample()',
        number: 'this.faker.number.int({ max: 10000000 })',
        boolean: 'this.faker.datatype.boolean()',
        Date: 'this.faker.date.anytime()'
      }

      if (property.custom) {
        definitions += `      ${property.name}: ${type[property.type]}`
      }

      if (this.properties.length - 1 !== i) {
        properties += '\n\n'
        if (definitions.length) definitions += ',\n'
      }
    })

    await this.generator
      .fileName(this.toCase(this.name))
      .destination(destination)
      .template('crud-model')
      .properties({ properties, definitions })
      .setNameProperties(true)
      .make()

    const importPath = this.generator.getImportPath()

    await this.rc.pushTo('models', importPath).save()
  }

  public async makeMigration() {
    this.cleanGenerator()

    const destination = Config.get(
      'rc.commands.make:crud.migration.destination',
      Path.migrations()
    )

    let properties = ''

    this.properties.forEach((property, i) => {
      if (property.isCreateDate || property.isUpdateDate) {
        if (properties.includes('builder.timestamps(true, true, true)')) {
          return
        }

        properties += `      builder.timestamps(true, true, true)${
          this.properties.length - 1 !== i ? '\n' : ''
        }`

        return
      }

      switch (property.type) {
        case 'increments':
          properties += `      builder.increments('${property.name}')`
          break
        case 'string':
          properties += `      builder.string('${property.name}')`
          break
        case 'boolean':
          properties += `      builder.boolean('${property.name}')`
          break
        case 'number':
          properties += `      builder.integer('${property.name}')`
          break
        case 'Date':
          properties += `      builder.timestamp('${property.name}')`
      }

      if (property.isPrimary) {
        properties += '.primary()'
      }

      if (property.isUnique) {
        properties += '.unique()'
      }

      if (!property.notNullable && property.type !== 'increments') {
        properties += '.nullable()'
      }

      if (property.isIndex) {
        properties += '.index()'
      }

      if (this.properties.length - 1 !== i) {
        properties += '\n'
      }
    })

    const tableName = String.pluralize(this.name)
    const namePascal = String.toPascalCase(`Create_${tableName}_Table`)
    let [date, time] = new Date().toISOString().split('T')

    date = date.replace(/-/g, '_')
    time = time.split('.')[0].replace(/:/g, '')

    await this.generator
      .fileName(`${sep}${date}_${time}_create_${tableName}_table`)
      .destination(destination)
      .properties({ namePascal, properties, tableName })
      .template('crud-migration')
      .setNameProperties(false)
      .make()
  }

  public async makeController() {
    this.cleanGenerator()

    const destination = Config.get(
      'rc.commands.make:crud.controller.destination',
      Path.controllers()
    )

    const serviceDest = Config.get(
      'rc.commands.make:crud.service.destination',
      Path.services()
    )

    let properties = ''

    this.properties
      .filter(p => p.custom)
      .forEach(p => {
        properties += `'${p.name}', `
      })

    this.generator
      .fileName(this.toCase(`${this.name}Controller`))
      .destination(destination)
      .properties({
        properties: properties.slice(0, properties.length - 2),
        serviceImportPath: new Generator()
          .fileName(this.toCase(`${this.name}Service`))
          .destination(serviceDest)
          .getImportPath(),
        crudNamePascal: this.namePascal,
        crudNameLower: this.nameLower
      })
      .template('crud-controller')
      .setNameProperties(true)

    await this.generator.make()

    const importPath = this.generator.getImportPath()

    await this.rc.pushTo('controllers', importPath).save()
  }

  public async makeService() {
    this.cleanGenerator()

    const destination = Config.get(
      'rc.commands.make:crud.service.destination',
      Path.services()
    )

    const modelDest = Config.get(
      'rc.commands.make:crud.model.destination',
      Path.models()
    )

    let propertiesToUpdate = ''

    this.properties
      .filter(p => p.custom)
      .forEach(property => {
        propertiesToUpdate += `    ${this.nameLower}.${property.name} = body.${property.name}\n`
      })

    await this.generator
      .fileName(this.toCase(`${this.name}Service`))
      .destination(destination)
      .properties({
        propertiesToUpdate,
        idType: this.isMongo ? 'string' : 'number',
        modelImportPath: new Generator()
          .fileName(this.toCase(this.name))
          .destination(modelDest)
          .getImportPath(),
        crudNamePascal: this.namePascal,
        crudNameLower: this.nameLower
      })
      .template('crud-service')
      .setNameProperties(true)
      .make()

    const importPath = this.generator.getImportPath()

    await this.rc.pushTo('services', importPath).save()
  }

  public async makeControllerTest() {
    this.cleanGenerator()

    const destination = Config.get(
      'rc.commands.make:crud.controller-test.destination',
      Path.tests('e2e')
    )

    const modelDest = Config.get(
      'rc.commands.make:crud.model.destination',
      Path.models()
    )

    let createBody = ''
    let updateBody = ''
    let showAssertBody = `id: ${this.nameLower}.id, `
    let createAssertBody = ''
    let updateAssertBody = `id: ${this.nameLower}.id, `

    this.properties
      .filter(p => p.custom)
      .forEach(property => {
        const type = {
          string: `'string'`,
          number: 1,
          boolean: true,
          Date: 'new Date()'
        }

        createBody += `${property.name}: ${type[property.type]}, `
        updateBody += `${property.name}: ${type[property.type]}, `
        showAssertBody += `${property.name}: ${type[property.type]}, `
        createAssertBody += `'${property.name}', `
        updateAssertBody += `${property.name}: ${type[property.type]}, `
      })

    await this.generator
      .fileName(this.toCase(`${this.name}ControllerTest`))
      .destination(destination)
      .properties({
        createBody: createBody.slice(0, createBody.length - 2),
        updateBody: updateBody.slice(0, updateBody.length - 2),
        showAssertBody: showAssertBody.slice(0, showAssertBody.length - 2),
        createAssertBody: createAssertBody.slice(
          0,
          createAssertBody.length - 2
        ),
        updateAssertBody: updateAssertBody.slice(
          0,
          updateAssertBody.length - 2
        ),
        modelImportPath: new Generator()
          .fileName(this.toCase(this.name))
          .destination(modelDest)
          .getImportPath(),
        crudNamePascal: this.namePascal,
        crudNamePascalPlural: String.pluralize(this.namePascal),
        crudNameLower: this.nameLower,
        crudNameLowerPlural: String.pluralize(this.nameLower)
      })
      .template('crud-controller-test')
      .setNameProperties(true)
      .make()
  }

  public async makeServiceTest() {
    this.cleanGenerator()

    const destination = Config.get(
      'rc.commands.make:crud.service-test.destination',
      Path.tests('unit')
    )

    const modelDest = Config.get(
      'rc.commands.make:crud.model.destination',
      Path.models()
    )

    const serviceDest = Config.get(
      'rc.commands.make:crud.service.destination',
      Path.services()
    )

    let createBody = ''
    let updateBody = ''

    this.properties
      .filter(p => p.custom)
      .forEach(property => {
        const type = {
          string: `'string'`,
          number: 1,
          boolean: true,
          Date: 'new Date()'
        }

        createBody += `${property.name}: ${type[property.type]}, `
        updateBody += `${property.name}: ${type[property.type]}, `
      })

    await this.generator
      .fileName(this.toCase(`${this.name}ServiceTest`))
      .destination(destination)
      .properties({
        createBody: createBody.slice(0, createBody.length - 2),
        updateBody: updateBody.slice(0, updateBody.length - 2),
        modelImportPath: new Generator()
          .fileName(this.toCase(this.name))
          .destination(modelDest)
          .getImportPath(),
        serviceImportPath: new Generator()
          .fileName(this.toCase(`${this.name}Service`))
          .destination(serviceDest)
          .getImportPath(),
        crudNamePascal: this.namePascal,
        crudNamePascalPlural: String.pluralize(this.namePascal),
        crudNameLower: this.nameLower,
        crudNameLowerPlural: String.pluralize(this.nameLower)
      })
      .template('crud-service-test')
      .setNameProperties(true)
      .make()
  }
}
