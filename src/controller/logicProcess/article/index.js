/**
 * @description 文章模块
 * @author wansongtao
 * @date 2020-12-27
 */
class Article {
    static database = require('../../database/database')

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
            console.error('Class Article => _verifyParam_(): ', ex.message)
            return false
        }
    }

    /**
     * @description 查询所有文章分类
     * @returns {object} {code: 200, data: {token}, message: '登录成功', success: true}
     */
    static async getArticleCategory() {
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

    /**
     * @description 添加文章
     * @param {*} data 
     * @returns {object} {code: 200, data: {token}, message: '登录成功', success: true}
     */
    static async addArticle(data) {
        let {
            userAccount,
            params: {
                articleTitle,
                articleImgUrl,
                articleContent,
                categoryId
            }
        } = data,
        message = {
            code: 300,
            data: {},
            message: '参数错误',
            success: false
        };

        let isVerify = Article._verifyParam_([{
            value: articleTitle,
            type: 'string'
        }, {
            value: articleContent,
            type: 'string'
        }, {
            value: categoryId,
            type: 'number'
        }])

        if (isVerify) {
            let curDate = new Date()

            curDate = curDate.toISOString().substr(0, 19).replace(/[TZ]/, ' ')

            let result = Article.database.insertArticle({
                articleTitle,
                articleImgUrl,
                articleContent,
                ADDACC: userAccount,
                ADDTIME: curDate,
                categoryId
            })

            if (result) {
                message = {
                    code: 200,
                    data: {},
                    message: '添加成功',
                    success: true
                }
            }
            else {
                message = {
                    code: 401,
                    data: {},
                    message: '服务器错误',
                    success: false
                }
            }
        }

        return message
    }


}

module.exports = {
    getArticleCategory: Article.getArticleCategory,
    addArticle: Article.addArticle
}
