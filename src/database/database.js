/**
 * @description 数据库模块
 * @author wansongtao
 * @date 2020-12-08
 */
class Database {
  // 引入MySQL模块
  static mysql = require('mysql');
  // 引入工具类
  static untils = require('../untils/untils');

  // 创建连接池
  static pool = this.mysql.createPool({
    connectionLimit: 88,
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'blog'
  });

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
   * @returns 成功返回执行结果，错误返回false
   */
  static _executeSql_(conn, sqlStr, data) {
    return new Promise((resolve, reject) => {
      try {
        conn.query(sqlStr, data, (err, result, field) => {
          conn.release() //释放连接

          if (err) {
            console.error('Class Database => _executeSql_(conn.query): ', err.stack)
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
   * @description 开始一个事务
   * @param {*} conn 数据库连接 
   * @returns {Promise} 成功返回一个打开了事务的数据库连接，失败返回false
   */
  static _beginTransaction_(conn) {
    return new Promise((resolve, reject) => {
      try {
        conn.beginTransaction(err => {
          if (err) {
            console.error('Class Database => _beginTransaction_(): ', err.stack)
            reject(false)
          }

          resolve(conn)
        })
      } catch (ex) {
        console.error('Class Database => _beginTransaction_(): ', ex.message)
        reject(false)
      }
    })
  }

  /**
   * @description 执行sql语句，对数据库进行增删改查(事务级别)
   * @param {object} conn 一个打开了事务的数据库连接
   * @param {String} sqlStr sql语句
   * @param {Object} data 要插入sql语句中的值
   * @returns {Promise} 成功返回执行结果，错误返回false并回滚之前的操作
   */
  static _transactionExecuteSql_(conn, sqlStr, data) {
    return new Promise((resolve, reject) => {
      try {
        conn.query(sqlStr, data, (err, result, field) => {
          if (err) {
            console.error('Class Database => _transactionExecuteSql_(): ', err.stack)
            conn.rollback()
            reject(false)
          }

          resolve(result)
        })
      } catch (ex) {
        console.error('Class Database => _transactionExecuteSql_(): ', ex.message)
        reject(false)
      }
    })
  }

  /**
   * @description 提交事务
   * @param {*} conn 一个开始了事务的数据库连接
   * @returns {Promise} 成功返回true，失败返回false并回滚事务
   */
  static _commitTransaction_(conn) {
    return new Promise((resolve, reject) => {
      try {
        conn.commit(err => {
          if (err) {
            console.error('Class Database => _commitTransaction_(): ', err.stack)
            conn.rollback()
            reject(false)
          }

          resolve(true)
        })
      } catch (ex) {
        console.error('Class Database => _commitTransaction_(): ', ex.message)
        reject(false)
      }
    })
  }

  /**
   * @description 查询操作
   * @param {string} sqlStr 查询语句，例如：'select * from table where column = ?'
   * @param {array} data 要插入查询语句中的值，例如：[10]
   * @returns {Promise} 成功返回查询结果，错误返回false
   */
  static async query(sqlStr, data) {
    return new Promise((resolve, reject) => {
        const isVerify = Database.untils.verifyParams([{
          value: sqlStr,
          type: 'String'
        }, {
          value: data,
          type: 'Array'
        }]);

        isVerify ? resolve() : reject('参数类型错误');
      })
      .then(() => {
        return Database._getConn_();
      })
      .then(conn => {
        return Database._executeSql_(conn, sqlStr, data);
      })
      .catch(err => {
        console.error('Class Database => query(): ', err);
        return false;
      })
  }

  /**
   * @description 修改操作
   * @param {string} sqlStr 修改语句，例如：'update table set colomn = ? where column2 = ?'
   * @param {array} data 要插入修改语句中的值，例如：[10, 20]
   * @returns {Promise} 修改成功返回true，失败返回false
   */
  static async update(sqlStr, data) {
    return new Promise((resolve, reject) => {
        const isVerify = Database.untils.verifyParams([{
          value: sqlStr,
          type: 'String'
        }, {
          value: data,
          type: 'Array'
        }]);

        isVerify ? resolve() : reject('arguments type error');
      })
      .then(() => {
        return Database._getConn_();
      })
      .then(async (conn) => {
        const result = await Database._executeSql_(conn, sqlStr, data);

        return new Promise((resolve, reject) => {
          result.affectedRows > 0 ? resolve(true) : reject(false);
        });
      })
      .catch(err => {
        console.error('Class Database => query(): ', err);
        return false;
      });
  }

  /**
   * @description 插入操作
   * @param {string} sqlStr 插入语句，例如：'insert into table set ?'
   * @param {array} data 要插入修改语句中的值，例如：{userName, userPwd}
   * @returns {Promise} 插入成功返回true，失败返回false
   */
  static async insert(sqlStr, data) {
    return new Promise((resolve, reject) => {
        const isVerify = Database.untils.verifyParams([{
          value: sqlStr,
          type: 'String'
        }, {
          value: data,
          type: 'Object'
        }]);

        isVerify ? resolve() : reject('arguments type error');
      })
      .then(() => {
        return Database._getConn_();
      })
      .then(async (conn) => {
        const result = await Database._executeSql_(conn, sqlStr, data);

        return new Promise((resolve, reject) => {
          // 插入成功后判断受影响的行数
          result.affectedRows > 0 ? resolve(true) : reject(false);
        })
      })
      .catch(err => {
        console.error('Class Database => insert(): ', err);
        return false;
      })
  }

  /**
   * @description 插入文章
   * @param {Object} data 要插入sql语句中的值{articleTitle,articleContent,ADDACC,ADDTIME,categoryId}
   * @returns {Promise} 成功返回true，失败返回false
   */
  static async insertArticle(data) {
    try {
      let conn = await Database._getConn_()

      conn = await Database._beginTransaction_(conn)

      let sqlStr = 'insert into articleinfo SET ?',
        {
          articleTitle,
          articleImgUrl,
          articleContent,
          ADDACC,
          ADDTIME,
          categoryId
        } = data,
        params = {
          articleTitle,
          articleContent,
          ADDACC,
          ADDTIME
        };

      articleImgUrl ? params.articleImgUrl = articleImgUrl : '';

      let result = await Database._transactionExecuteSql_(conn, sqlStr, params)

      sqlStr = 'INSERT INTO articletype set ?'

      result = await Database._transactionExecuteSql_(conn, sqlStr, {
        articleId: result.insertId,
        categoryId
      })

      result = await Database._commitTransaction_(conn)

      return result
    } catch (ex) {
      console.error('Class Database => insertArticle(): ', ex.message)
      return false
    }
  }

}

module.exports = {
  query: Database.query,
  update: Database.update,
  insert: Database.insert,
  insertArticle: Database.insertArticle
}
