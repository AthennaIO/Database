/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Folder } from '@athenna/common'
import { ArtisanProvider } from '@athenna/artisan'
import { BeforeEach, AfterEach, Mock } from '@athenna/test'
import { TestCommand } from '@athenna/artisan/testing/plugins'

export class BaseCommandTest {
  @BeforeEach()
  public async beforeEach() {
    new ArtisanProvider().register()

    TestCommand.setArtisanPath(Path.fixtures('consoles/base-console.ts'))
  }

  @AfterEach()
  public async afterEach() {
    Mock.restoreAll()
    ioc.reconstruct()

    await Folder.safeRemove(Path.fixtures('storage'))
  }
}
