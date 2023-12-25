/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File, Folder } from '@athenna/common'
import { ArtisanProvider } from '@athenna/artisan'
import { BeforeEach, AfterEach, Mock } from '@athenna/test'
import { TestCommand } from '@athenna/artisan/testing/plugins'

export class BaseCommandTest {
  private pjson = new File(Path.pwd('package.json')).getContentSync()

  @BeforeEach()
  public async beforeEach() {
    new ArtisanProvider().register()

    TestCommand.setArtisanPath(Path.fixtures('consoles/base-console.ts'))
  }

  @AfterEach()
  public async afterEach() {
    Config.clear()
    Mock.restoreAll()
    ioc.reconstruct()

    await Folder.safeRemove(Path.fixtures('storage'))
    await new File(Path.pwd('package.json')).setContent(this.pjson)
  }
}
