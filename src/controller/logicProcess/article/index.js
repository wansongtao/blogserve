/**
 * @description 文章模块
 * @author wansongtao
 * @date 2020-12-27
 */
class Article {
    static database = require('../../../database/database');

    /**
     * @description 获取用户角色
     * @param {string} userAccount 用户账号
     * @returns {number} 成功返回角色id，失败返回0
     */
    static async getRoles(userAccount) {
        let rolesId = 0;

        const queryStr = 'select powerId from userpower where userAccount = ?';
        const data = await Article.database.query(queryStr, [userAccount]);

        if (data !== false && data.length > 0) {
            rolesId = data[0].powerId;
        }

        return rolesId;
    }

    /**
     * @description 查询所有文章分类
     * @returns {object} {code: 200, data: {categories}, message: '登录成功', success: true}
     */
    static async getArticleCategory() {
        const queryStr = 'SELECT categoryId, categoryType from articlecategory WHERE ISDELETE = ?';

        const data = await Article.database.query(queryStr, [0]);
        let message = {};

        if (data === false) {
            message = {
                code: 401,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            };
        } else if (data.length > 0) {
            message = {
                code: 200,
                data: {
                    categories: data
                },
                message: '获取成功',
                success: true
            };
        } else {
            message = {
                code: 305,
                data: {},
                message: '未查找到任何分类',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 添加文章
     * @param {object} data {userAccount, articleTitle, articleContent, categoryId}
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async addArticle({
        userAccount,
        articleTitle,
        articleContent,
        categoryId
    }) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        let curDate = new Date();
        let myDate = curDate.toLocaleDateString().replace(/\//g, '-');
        let myTime = curDate.toTimeString().substr(0, 8);

        const result = Article.database.insertArticle({
            articleTitle,
            articleContent,
            ADDACC: userAccount,
            ADDTIME: myDate + ' ' + myTime,
            categoryId
        });

        if (result) {
            message = {
                code: 200,
                data: {},
                message: '添加成功',
                success: true
            };
        } else {
            message = {
                code: 401,
                data: {},
                message: '添加失败',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 查询用户可以看到的文章
     * @param {object} search {currentPage, pageSize}
     * @returns {object} {code: 200, data: {articleId, articleTitle, author, categoryType, ADDTIME}, message: '登录成功', success: true}
     */
    static async queryArticleList(search) {
        let {
            currentPage,
            pageSize,
            userAccount
        } = search;

        const rolesId = await Article.getRoles(userAccount);
        
        let roleQuery = '', 
        queryArr = [];

        if (rolesId === 0) {
            return {
                code: 403,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            };
        } else if (rolesId === 10003) {
            // 普通用户只能查看自己未删除的文章，或后台用户、所有人可见的文章
            roleQuery = ' isdelete = ? and ADDACC = ? OR stateNum IN (2, 3) and isdelete = ? ';
            queryArr = [0, userAccount, 0];
        } else if (rolesId === 10001 || rolesId === 10002) {
            // 管理员可以查看未删除的文章
            roleQuery = ' isdelete = ? ';
            queryArr = [0];
        }
        

        // 查询文章数量
        let queryNumber = 'select count(articleId) as articleCount from articlelist where '
        let count = await Article.database.query(queryNumber + roleQuery, queryArr);

        if (count !== false) {
            count = count[0].articleCount;
        }

        // 查询对应页码的文章
        if (isNaN(Number(currentPage))) {
            // 当前页码不为数字，则默认第一页
            currentPage = 1
        } else {
            // 转为正整数
            currentPage = Math.abs(currentPage).toFixed()
        }

        if (isNaN(Number(pageSize))) {
            // 每页大小不为数字，则默认每页十条
            pageSize = 10
        } else {
            // 转为正整数
            pageSize = Math.abs(pageSize).toFixed()
        }

        if ((currentPage - 1) * pageSize > count) {
            // 在当前页码超出范围时，设为默认值
            currentPage = 1
            pageSize = 10
        }

        // mysql语句: limit 每页条数 offset 起始位置   第一页从0开始，所以减一
        let pageSizeQuery = ` ORDER BY articleId DESC limit ${pageSize} offset ${(currentPage - 1) * pageSize}`;
        let queryStr = 'SELECT articleId, articleTitle, author, categoryType, ADDTIME from articlelist where ';
         queryStr += (roleQuery + pageSizeQuery); 

        const data = await Article.database.query(queryStr, [0, userAccount, 0]);
        let message = {};

        if (data === false) {
            message = {
                code: 401,
                data: {},
                message: '服务器错误',
                success: false
            };
        } else if (data.length > 0) {
            message = {
                code: 200,
                data: {
                    articles: data,
                    count
                },
                message: '获取成功',
                success: true
            };

        } else {
            message = {
                code: 305,
                data: {},
                message: '文章列表获取失败',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 获取文章内容
     * @param {number} id 文章id
     * @returns {object} {code: 200, data: {articleContent}, message: '', success: true}
     */
    static async queryArticleContent(id) {
        const queryStr = 'SELECT articleContent from articleinfo WHERE ISDELETE = ? and articleId = ?';

        const data = await Article.database.query(queryStr, [0, id]);
        let message = {};

        if (data === false) {
            message = {
                code: 401,
                data: {},
                message: '服务器错误',
                success: false
            };
        } else if (data.length > 0) {
            message = {
                code: 200,
                data: {
                    articleContent: data[0].articleContent
                },
                message: '获取成功',
                success: true
            };
        } else {
            message = {
                code: 305,
                data: {},
                message: '未查找到该文章',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 删除文章
     * @param {object} data {id, userAccount}
     * @returns {object} {code: 200, data: {}, message: '', success: true}
     */
    static async delArticle({
        id,
        userAccount
    }) {
        let delTime = new Date().toISOString();
        delTime = delTime.replace(/T|Z/g, ' ').substr(0, 19);

        const queryStr = 'UPDATE articleinfo SET DELETEACC = ?, DELETETIME = ?, ISDELETE = ? WHERE articleId = ?';

        const data = await Article.database.update(queryStr, [userAccount, delTime, 1, id]);
        let message = {};

        if (data) {
            message = {
                code: 200,
                data: {},
                message: '删除成功',
                success: true
            };
        } else {
            message = {
                code: 401,
                data: {},
                message: '删除失败',
                success: false
            };
        }

        return message;
    }
}

module.exports = {
    getArticleCategory: Article.getArticleCategory,
    addArticle: Article.addArticle,
    queryArticleList: Article.queryArticleList,
    queryArticleContent: Article.queryArticleContent,
    delArticle: Article.delArticle
};