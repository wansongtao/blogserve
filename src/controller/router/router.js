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
    const process = require('../logicProcess')

    // 创建路由实例
    this.myRouter = express.Router()

    // 返回静态资源
    this.myRouter.use('/upload', express.static(path.join(__dirname, '../../upload')))

    // 登录接口
    this.myRouter.post('/admin/login', process.login)

    // 登出接口
    this.myRouter.get('/admin/logout', process.logout);

    // 获取用户信息
    this.myRouter.get('/admin/getuserinfo', process.getUserInfo)

    // 上传图片接口
    this.myRouter.post('/admin/upload', process.uploadImg)

    // 修改用户信息
    this.myRouter.post('/admin/useredit', process.editUserInfo)

    // 获取文章分类
    this.myRouter.get('/admin/getcategory', process.getCategory)

    // 添加文章接口
    this.myRouter.post('/admin/addarticle', process.addArticle)

    // 获取文章信息
    this.myRouter.get('/admin/getArticleInfo', process.getArticleInfo)
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
