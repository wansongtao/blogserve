/**
 * @description 数据库模块
 * @author 万松涛
 * @date 2020-12-08
 */
class Database {
  // 引入MySQL模块
  static mysql = require('mysql');
  // 引入工具类
  static untils = require('../untils/untils');

  // 创建连接池
  static pool = this.mysql.createPool({
    connectionLimit: 666,
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
          console.error('Class Database => _getConn_(): 获取数据库连接失败。', err.stack);
          reject(false);
        }

        resolve(conn);
      });
    });
  }

  /**
   * @description 执行sql语句，对数据库进行增删改查
   * @param {object} conn 数据库连接
   * @param {String} sqlStr sql语句
   * @param {Object} data 要插入sql语句中的值
   * @returns {Promise} 成功返回执行结果 resolve(result)，错误返回 reject(false)
   */
  static _executeSql_(conn, sqlStr, data) {
    return new Promise((resolve, reject) => {
      // 使用try...catch语句捕获未知错误
      try {
        conn.query(sqlStr, data, (err, result, field) => {
          conn.release(); //释放连接

          if (err) {
            console.error('Class Database => _executeSql_(): sql语句执行错误。', err.stack);
            reject(false);
          }

          resolve(result);
        });
      } catch (ex) {
        console.error('Class Database => _executeSql_(): ', ex.message);
        reject(false);
      }
    });
  }

  /**
   * @description 开始一个事务
   * @param {object} conn 数据库连接 
   * @returns {Promise} 成功返回一个开始事务的数据库连接 resolve(conn)，失败reject(false)
   */
  static _beginTransaction_(conn) {
    return new Promise((resolve, reject) => {
      try {
        conn.beginTransaction(err => {
          if (err) {
            console.error('Class Database => _beginTransaction_(): 事务启动失败。', err.stack);
            reject(false);
          }

          resolve(conn);
        });
      } catch (ex) {
        console.error('Class Database => _beginTransaction_(): ', ex.message);
        reject(false);
      }
    });
  }

  /**
   * @description 事务模式：执行sql语句，对数据库进行增删改查
   * @param {object} conn 一个打开了事务的数据库连接
   * @param {string} sqlStr sql语句
   * @param {object} data 要插入sql语句中的值
   * @returns {promise} 返回一个promise，成功resolve(result)，错误reject(false)并回滚之前的操作
   */
  static _transactionExecuteSql_(conn, sqlStr, data) {
    return new Promise((resolve, reject) => {
      try {
        conn.query(sqlStr, data, (err, result, field) => {
          if (err) {
            console.error('Class Database => _transactionExecuteSql_(): sql语句执行失败。', err.stack);
            conn.rollback(); // 回滚数据库操作
            reject(false);
          }

          resolve(result);
        })
      } catch (ex) {
        console.error('Class Database => _transactionExecuteSql_(): ', ex.message);
        reject(false);
      }
    });
  }

  /**
   * @description 提交事务
   * @param {object} conn 一个开始了事务的数据库连接
   * @returns {Promise} 成功resolve(true)，失败reject(false)并回滚事务
   */
  static _commitTransaction_(conn) {
    return new Promise((resolve, reject) => {
      try {
        conn.commit((err) => {
          if (err) {
            console.error('Class Database => _commitTransaction_(): 事务提交失败。', err.stack);
            conn.rollback(); // 回滚数据库操作
            conn.release(); //释放连接
            reject(false);
          }

          conn.release(); //释放连接
          resolve(true);
        });
      } catch (ex) {
        console.error('Class Database => _commitTransaction_(): ', ex.message);
        reject(false);
      }
    });
  }

  /**
   * @description 查询操作
   * @param {string} sqlStr 查询语句，例如：'select * from table where column = ?'
   * @param {array} data 要插入查询语句中的值，例如：[10]
   * @returns {Promise} 成功 resolve(result)查询结果：一个数组，未查询到任何数据则为空数组[]，错误返回false(注意：不是reject(false))
   */
  static async query(sqlStr, data) {
    return new Promise((resolve, reject) => {
        // 验证参数类型
        const isVerify = Database.untils.verifyParams([{
          value: sqlStr,
          type: 'String'
        }, {
          value: data,
          type: 'Array'
        }]);

        // resolve则进入then，reject则进入catch
        isVerify ? resolve() : reject('参数类型错误');
      })
      .then(() => {
        // 获取数据库连接，返回一个promise对象。resolve则进入下一个then，reject则直接进入catch
        return Database._getConn_();
      })
      .then((conn) => {
        // conn: 上一个then中resolve的值
        // 执行sql语句，返回一个promise对象。resolve返回执行结果，reject进入catch
        return Database._executeSql_(conn, sqlStr, data);
      })
      .catch((err) => {
        // 捕获reject，打印错误信息并返回false
        console.error('Class Database => query(): ', err);
        return false;
      });
  }

  /**
   * @description 修改操作
   * @param {string} sqlStr 修改语句，例如：'update table set colomn = ? where column2 = ?'
   * @param {array} data 要插入修改语句中的值，例如：[10, 20]
   * @returns {Promise} 修改成功resolve(true)，失败返回false(注意：不是reject(false))
   */
  static async update(sqlStr, data) {
    // 外部使用await是获取不到reject抛出的值的，但是可以使用catch获取。
    return new Promise((resolve, reject) => {
        // 验证参数数据类型
        const isVerify = Database.untils.verifyParams([{
          value: sqlStr,
          type: 'String'
        }, {
          value: data,
          type: 'Array'
        }]);

        // resolve则进入then，reject则进入catch
        isVerify ? resolve() : reject('参数类型错误');
      })
      .then(() => {
        // 获取数据库连接，返回一个promise对象。resolve则进入下一个then，reject则直接进入catch
        return Database._getConn_();
      })
      .then((conn) => {
        // conn: 上一个then中resolve的值
        // 执行sql语句，返回一个promise对象。resolve则进入下一个then，reject则直接进入catch
        return Database._executeSql_(conn, sqlStr, data);
      })
      .then((result) => {
        // 修改成功resolve(true)
        return new Promise((resolve, reject) => {
          result.affectedRows > 0 ? resolve(true) : reject('修改失败。');
        });
      })
      .catch((err) => {
        // 捕获reject，打印错误信息并返回false。 err为reject(val)的值 => err = val
        console.error('Class Database => query(): ', err);
        // 调用catch并返回值，外部使用await才可以获取reject的值，当然catch也可以对返回的值做一定的处理。
        return false;
      });
  }

  /**
   * @description 插入操作
   * @param {string} sqlStr 插入语句，例如：'insert into table set ?'
   * @param {object} data 要插入修改语句中的值，例如：{userName, userPwd}
   * @returns {Promise} 插入成功resolve(true)，失败返回false
   */
  static async insert(sqlStr, data) {
    return new Promise((resolve, reject) => {
        // 验证参数数据类型
        const isVerify = Database.untils.verifyParams([{
          value: sqlStr,
          type: 'String'
        }, {
          value: data,
          type: 'Object'
        }]);

        isVerify ? resolve() : reject('参数类型错误');
      })
      .then(() => {
        // 获取数据库连接，返回一个promise对象。resolve则进入下一个then，reject则直接进入catch
        return Database._getConn_();
      })
      .then((conn) => {
        // conn: 上一个then中resolve的值
        // 执行sql语句，返回一个promise对象。resolve则进入下一个then，reject则直接进入catch
        return Database._executeSql_(conn, sqlStr, data);
      })
      .then((result) => {
        return new Promise((resolve, reject) => {
          // 插入成功后判断受影响的行数
          result.affectedRows > 0 ? resolve(true) : reject(false);
        });
      })
      .catch((err) => {
        console.error('Class Database => insert(): ', err);
        return false;
      });
  }

  /**
   * @description 插入文章
   * @param {object} data 要插入sql语句中的值{articleTitle,articleContent,ADDACC,ADDTIME,categoryId}
   * @returns 异步函数 成功返回true，失败返回false
   */
  static async insertArticle(data) {
    try {
      let conn = await Database._getConn_().catch(() => {
        console.error('Class Database => insertArticle(): 获取数据库连接失败。');
        return false;
      });

      // 获取数据库连接失败
      if (!conn) {
        return false;
      }

      conn = await Database._beginTransaction_(conn).catch(() => {
        console.error('Class Database => insertArticle(): 启动事务失败。');
        return false;
      });

      if (!conn) {
        return false;
      }

      let sqlStr = 'insert into articleinfo SET ?',
        {
          articleTitle,
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

      let result = await Database._transactionExecuteSql_(conn, sqlStr, params).catch(() => {
        console.error('Class Database => insertArticle(): 插入文章信息失败。');
        return false;
      });

      if (!result) {
        return false;
      }

      sqlStr = 'INSERT INTO articletype set ?';
      const articleId = result.insertId;

      result = await Database._transactionExecuteSql_(conn, sqlStr, {
        articleId,
        categoryId
      }).catch(() => {
        console.error('Class Database => insertArticle(): 插入文章类型失败。');
        return false;
      });

      if (!result) {
        return false;
      }

      sqlStr = 'INSERT INTO articlestate set ?';

      result = await Database._transactionExecuteSql_(conn, sqlStr, {
        articleId,
        stateNum: 1
      }).catch(() => {
        console.error('Class Database => insertArticle(): 插入文章状态失败');
        return false;
      });

      if (!result) {
        return false;
      }

      result = await Database._commitTransaction_(conn).catch(() => {
        console.error('Class Database => insertArticle(): 事务提交失败，文章插入失败。');
        return false;
      });

      return result;
    } catch (ex) {
      console.error('Class Database => insertArticle(): ', ex.message);
      return false;
    }
  }

  /**
   * @description 插入用户
   * @param {object} data {userAccount,userPassword,ADDACC,ADDTIME,powerId,userName,userGender}
   * @returns 插入成功返回true，失败返回false
   */
  static async insertUser(data) {
    const {
      userAccount,
      userPassword,
      ADDACC,
      ADDTIME,
      powerId,
      userName,
      userGender
    } = data;
    let executeConn = null;

    return Database._getConn_().then((conn) => {
        return Database._beginTransaction_(conn);
      })
      .then((conn) => {
        // 向用户表插入数据
        const sqlStr = 'insert into users set ?';
        executeConn = conn;

        return Database._transactionExecuteSql_(executeConn, sqlStr, {
          userAccount,
          userPassword,
          ADDACC,
          ADDTIME
        });
      })
      .then(() => {
        // 向用户信息表插入数据
        const sqlStr = 'insert into userinfo set ?';

        return Database._transactionExecuteSql_(executeConn, sqlStr, {
          userAccount,
          userName,
          userGender
        });
      })
      .then(() => {
        // 向用户权限表插入数据
        const sqlStr = 'insert into userpower set ?';

        return Database._transactionExecuteSql_(executeConn, sqlStr, {
          userAccount,
          powerId
        });
      })
      .then(() => {
        // 提交
        return Database._commitTransaction_(executeConn);
      })
      .catch(() => {
        return false;
      });
  }

  /**
   * @description 插入评论
   * @param {object} data {articleId, commentContent, parentId, replyId}
   * @returns 插入成功返回true，失败返回false
   */
  static async insertComment({
    articleId,
    commentContent,
    parentId,
    replyId
  }) {
    const curDate = new Date();
    const myDate = curDate.toLocaleDateString();
    const myTime = curDate.toTimeString().substr(0, 8);
    const commentTime = myDate + ' ' + myTime;

    let executeConn = null;
    let commentId = '';

    return Database._getConn_().then((conn) => {
        // 开始事务
        return Database._beginTransaction_(conn);
      })
      .then((conn) => {
        // 向评论表插入数据
        const sqlStr = `insert into comment set ?`;
        executeConn = conn;

        return Database._transactionExecuteSql_(executeConn, sqlStr, {
          commentContent,
          commentTime
        });
      })
      .then((result) => {
        // 向文章评论表插入数据
        const sqlStr = 'insert into articlecomment set ?';
        commentId = result.insertId;

        return Database._transactionExecuteSql_(executeConn, sqlStr, {
          articleId,
          commentId,
        });
      })
      .then(() => {
        if (parentId == undefined) {
          return Promise.resolve();
        }

        // 向子评论表插入数据
        const sqlStr = 'insert into childrencomment set ?';
        const childId = commentId;

        const data = {parentId, childId};

        if (replyId != undefined) {
          data.replyId = replyId;
        }

        return Database._transactionExecuteSql_(executeConn, sqlStr, data);
      })
      .then(() => {
        // 提交事务
        return Database._commitTransaction_(executeConn);
      })
      .catch(() => {
        return false;
      });
  }
}

module.exports = {
  query: Database.query,
  update: Database.update,
  insert: Database.insert,
  insertArticle: Database.insertArticle,
  insertUser: Database.insertUser,
  insertComment: Database.insertComment
};