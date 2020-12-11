/**
 * @description 数据库模块
 * @author wansongtao
 * @date 2020-12-08
 */
class Database {
  static mysql = require('mysql')

  static pool = this.mysql.createPool({
    connectionLimit: 88,
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'blog'
  })

  /**
   * @description 验证参数的类型是否正确
   * @param {Array} param [{value: value, type: argumentType}
   * @returns {boolean} 通过返回true
   */
  static _verifyParam_(param = []) {
    try {
      return param.every(item => {
        let type = item.type.toUpperCase()

        return item.value.constructor.toString().toUpperCase().indexOf(type) > -1
      })
    } catch (ex) {
      console.error('Class Database => _verifyParam_(): ', ex.message)
      return false
    }
  }

  /**
   * @description 从连接池中获取数据库连接
   * @returns 返回一个promise，resolve(conn), reject(false)
   */
  static _getConn_() {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, conn) => {
        if (err) {
          console.error('Class Database => getConn(): ', err.stack)
          reject(false)
        }

        resolve(conn)
      })
    })
  }

  /**
   * @description 执行sql语句，对数据库进行增删改查
   * @param {object} conn 数据库连接
   * @param {String} sqlStr sql语句
   * @param {Object} data 要插入sql语句中的值
   * @returns 返回执行结果，错误返回false
   */
  static _executeSql_(conn, sqlStr, data) {
    return new Promise((resolve, reject) => {
      try {
        conn.query(sqlStr, data, (err, result, field) => {
          conn.release() //释放连接

          if (err) {
            consolve.error('Class Database => _executeSql_(conn.query): ', err.stack)
            reject(false)
          }

          resolve(result)
        })
      } catch (ex) {
        consolve.error('Class Database => _executeSql_(): ', ex.message)
        reject(false)
      }
    })
  }

  /**
   * @description 查询操作
   * @param {string} sqlStr 查询语句
   * @param {array} data 要插入查询语句中的值
   * @returns 返回查询结果，错误返回false
   */
  static async query(sqlStr, data) {
    return new Promise((resolve, reject) => {
        let isVerify = Database._verifyParam_([{
          value: sqlStr,
          type: 'String'
        }, {
          value: data,
          type: 'Array'
        }])

        isVerify ? resolve() : reject('参数类型错误')
      })
      .then(() => {
        return Database._getConn_()
      })
      .then(conn => {
        return Database._executeSql_(conn, sqlStr, data)
      })
      .catch(err => {
        console.error('Class Database => query(): ', err)
        return false
      })
  }
}

module.exports = Database