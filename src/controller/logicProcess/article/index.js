/**
 * @description 文章模块
 * @author wansongtao
 * @date 2020-12-27
 */
class Article {
    static database = require('../../database/database')

    /**
     * @description 查询所有文章分类
     */
    static async getArticleCategory () {
        let queryStr = 'SELECT categoryId, categoryType from articlecategory WHERE ISDELETE = ?'

        let data = await Article.database.query(queryStr, [0]), 
        message = {}

        if (data[0]) {
            message = {
                code: 200,
                data: {
                    categories: data
                },
                message: '获取成功',
                success: true
            }
        } else if (data[0] == null) {
            message = {
                code: 302,
                data: {},
                message: '未查找到任何分类',
                success: false
            }
        } else {
            message = {
                code: 401,
                data: {},
                message: '服务器错误',
                success: false
            }
        }

        return message
    }

    
}

module.exports = {
    getArticleCategory: Article.getArticleCategory
}
