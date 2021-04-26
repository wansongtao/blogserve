/**
 * @description 主程序文件
 * @author 万松涛
 * @date 2020-12-08
 */
class Index {
  constructor() {
    //   引入模块
    const express = require('express');
    const bodyParser = require('body-parser');
    const router = require('./src/router/router');
    const cookieParser = require('cookie-parser');

    // 创建express实例
    const webApp = express();

    // 设置接收数据的格式，表单数据和json格式的都行
    webApp.use(bodyParser.urlencoded({
      extended: false
    }));
    webApp.use(bodyParser.json());

    // 用来获取cookie，req.cookies.authorization
    webApp.use(cookieParser());

    webApp.all('*', (req, res, next) => {
      // 只允许 http://localhost:5050 跨域请求接口
      res.header('Access-Control-Allow-Origin', 'http://localhost:5050');
      // 设置请求头
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS, PATCH');

      next();
    });

    // 注册路由实例
    webApp.use(router);

    // 服务器错误处理
    webApp.use((err, req, res, next) => {
      console.error('server error: ', err);

      res.status(500).send({
        statusCode: 500,
        message: '服务器错误'
      });
    });

    // 路径错误处理
    webApp.use((req, res) => {
      res.status(404).send({
        statusCode: 404,
        message: '路径错误，找不到资源'
      });
    });

    // 设置服务器端口
    webApp.listen(6060, (err) => {
      if (err) {
        console.error(err);
      }
    });

  }

}

// 创建实例
new Index();