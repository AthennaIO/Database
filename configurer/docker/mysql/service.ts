/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export default {
  container_name: 'athenna_mysql',
  image: 'mysql',
  ports: ['3306:3306'],
  environment: {
    MYSQL_DATABASE: 'athenna',
    MYSQL_ROOT_PASSWORD: 'root',
    MYSQL_ALLOW_EMPTY_PASSWORD: 'yes'
  }
}
