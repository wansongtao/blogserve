/**
 * @description 路由模块
 * @author wansongtao
 * @date 2020-12-08
 */
class Router {
  constructor () {
    //   引入模块
    const express = require('express')
    const path = require('path')
    const process = require('../process/processing')

    // 创建路由实例
    this.myRouter = express.Router()

    // 返回静态资源
    this.myRouter.use('/upload', express.static(path.join(__dirname, '../upload')))

    // 登录接口
    this.myRouter.post('/login', process.login)
  }

  /**
   * @description 返回路由实例
   */
  backRouter () {
    return this.myRouter
  }
}

const ROUTERS = new Router()

// 导出路由实例
module.exports = ROUTERS.backRouter()
