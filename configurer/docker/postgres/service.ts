/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export default {
  container_name: 'athenna_postgres',
  image: 'postgres',
  ports: ['5432:5432'],
  environment: {
    POSTGRES_DB: 'athenna',
    POSTGRES_USER: 'root',
    POSTGRES_PASSWORD: 'root',
    POSTGRES_ROOT_PASSWORD: 'root'
  }
}
