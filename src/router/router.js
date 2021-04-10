/**
 * @description 路由模块
 * @author wansongtao
 * @date 2020-12-08
 */
class Router {
  constructor () {
    //   引入模块
    const express = require('express');
    const path = require('path');
    const process = require('../controller/logicProcess');

    // 创建路由实例
    this.myRouter = express.Router();

    // 返回静态资源
    this.myRouter.use('/upload', express.static(path.join(__dirname, '../upload')));

    // 登录接口
    this.myRouter.post('/admin/login', process.login);

    // 登出接口
    this.myRouter.get('/admin/logout', process.logout);

    // 获取用户信息
    this.myRouter.get('/admin/getuserinfo', process.getUserInfo);

    // 上传图片接口
    this.myRouter.post('/admin/upload', process.uploadImg);

    // 修改用户信息
    this.myRouter.post('/admin/useredit', process.editUserInfo);

    // 获取文章分类
    this.myRouter.get('/admin/getcategory', process.getCategory);

    // 添加文章接口
    this.myRouter.post('/admin/addarticle', process.addArticle);

    // 获取文章列表
    this.myRouter.get('/admin/getArticleList', process.getArticleList);

    // 获取文章内容
    this.myRouter.get('/admin/getArticleContent', process.queryArticleContent);

    // 删除文章
    this.myRouter.get('/admin/delArticle', process.delArticle);

    // 获取用户列表
    this.myRouter.get('/admin/getuserlist', process.getUserList);

    // 删除用户
    this.myRouter.post('/admin/deluser', process.delUser);

    // 重置用户密码
    this.myRouter.post('/admin/resetuserpwd', process.resetUser);

    // 获取权限列表
    this.myRouter.get('/admin/getpowerlist', process.getPowerList);

    // 添加用户
    this.myRouter.post('/admin/adduser', process.addUser);

    // 修改密码
    this.myRouter.post('/admin/updatepwd', process.updatePwd);

    // 获取所有文章
    this.myRouter.get('/admin/allarticle', process.getAllArticle);

    // 审核文章
    this.myRouter.post('/admin/checkarticle', process.checkArticle);

    // 恢复文章
    this.myRouter.get('/admin/reduction', process.reductionArticle);

    // 修改分类名称
    this.myRouter.get('/admin/updatecategory', process.updateCategory);

    // 添加分类
    this.myRouter.post('/admin/addcategory', process.addCategory);

    // 删除分类
    this.myRouter.get('/admin/delcategory', process.delCategory);

    // 获取所有文章评论列表
    this.myRouter.get('/admin/allcomment', process.allComment);

    // 删除评论
    this.myRouter.get('/admin/delcomment', process.delComment);

    // 评论审核
    this.myRouter.post('/admin/checkcomment', process.checkComment);

    // 获取留言列表
    this.myRouter.get('/admin/getmessage', process.getMessageList);

    // 删除留言
    this.myRouter.post('/admin/delmessage', process.delMessage);

    // 留言审核
    this.myRouter.post('/admin/checkmessage', process.checkMessage);


    // 前台接口
    // 获取用户信息
    this.myRouter.get('/blog/getuserinfo', process.blogUserInfo);

    // 热门文章接口
    this.myRouter.get('/blog/gethotarticle', process.blogHotArticles);

    // 最新文章接口
    this.myRouter.post('/blog/getnewarticle', process.blogNewArticles);

    // 文章内容接口
    this.myRouter.get('/blog/getarticlecontent', process.blogArticleContent);

    // 评论列表接口
    this.myRouter.get('/blog/getcommentlist', process.blogCommentList);

    // 搜索文章接口
    this.myRouter.get('/blog/searcharticle', process.blogSearchArticle);

    // 发表评论接口
    this.myRouter.post('/blog/addcomment', process.blogAddComment);

    // 留言接口
    this.myRouter.post('/blog/addmessage', process.blogAddMessage);

    // 获取留言列表接口
    this.myRouter.get('/blog/getmessage', process.blogGetMessage);

    // 获取文章分类
    this.myRouter.get('/blog/getcategory', process.blogGetCategory);
  }

  /**
   * @description 返回路由实例
   */
  backRouter () {
    return this.myRouter;
  }
}

const ROUTERS = new Router();

// 导出路由实例
module.exports = ROUTERS.backRouter();
