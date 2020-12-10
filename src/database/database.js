/**
 * @description 数据库模块
 * @author wansongtao
 * @date 2020-12-08
 */
class Database {
  static mysql = require('mysql')

  static pool () {
    // const mysql = require('mysql')

    return mysql.createPool({
      connectionLimit: 88,
      host: '127.0.0.1',
      user: 'root',
      password: 'password',
      database: 'blog'
    })
  }
}

module.exports = Database
