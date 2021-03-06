/**
 * @description 文章模块
 * @author 万松涛
 * @date 2020-12-27
 */
class Article {
    static database = require('../../database/database');

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
        const queryStr = 'SELECT categoryId, categoryType, ADDACC, ADDTIME from articlecategory WHERE ISDELETE = ?';

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
        let myDate = curDate.toLocaleDateString().split('/');
        let myTime = curDate.toTimeString().substr(0, 8);

        let adddate = myDate[0] + '-';
        let month = myDate[1];
        let day = myDate[2];

        if (month.length === 1) {
            month = '0' + month;
        }

        if (day.length === 1) {
            day = '0' + day;
        }

        adddate = adddate + month + '-' + day;

        const result = Article.database.insertArticle({
            articleTitle,
            articleContent,
            ADDACC: userAccount,
            ADDTIME: adddate + ' ' + myTime,
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
     * @param {object} search {keyword, userAccount, currentPage, pageSize}
     * @returns {object} {code: 200, data: {articleId, articleTitle, author, categoryType, ADDTIME}, message: '登录成功', success: true}
     */
    static async queryArticleList(search) {
        let {
            keyword,
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

        if (typeof keyword === 'string' && keyword.trim().length > 0) {
            roleQuery += ` and articleTitle REGEXP '${keyword}' OR author REGEXP '${keyword}' OR addtime REGEXP '${keyword}' `;
        }

        // 查询文章数量
        let queryNumber = 'select count(articleId) as articleCount from articlelist where '
        let count = await Article.database.query(queryNumber + roleQuery, queryArr);

        if (count !== false && count.length > 0) {
            count = count[0].articleCount;
        } else {
            return {
                code: 305,
                data: {},
                message: '未查找到任何相关文章',
                success: true
            };
        }

        // 查询对应页码的文章
        if (isNaN(Number(currentPage))) {
            // 当前页码不为数字，则默认第一页
            currentPage = 1;
        } else {
            // 转为正整数
            currentPage = Math.abs(currentPage).toFixed();
        }

        if (isNaN(Number(pageSize))) {
            // 每页大小不为数字，则默认每页十条
            pageSize = 10;
        } else {
            // 转为正整数
            pageSize = Math.abs(pageSize).toFixed();
        }

        if ((currentPage - 1) * pageSize > count) {
            // 在当前页码超出范围时，设为默认值
            currentPage = 1;
            pageSize = 10;
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
                message: '未查找到任何相关文章',
                success: true
            };
        }

        return message;
    }

    /**
     * @description 获取文章内容
     * @param {number} id 文章id
     * @param {string} userAccount 用户账号
     * @returns {object} {code: 200, data: {articleContent}, message: '', success: true}
     */
    static async queryArticleContent(id, userAccount) {
        const queryStr = 'SELECT articleContent, ADDACC, stateNum from articlelist WHERE articleId = ?';

        const data = await Article.database.query(queryStr, [id]);
        let message = {};

        if (data === false) {
            message = {
                code: 401,
                data: {},
                message: '服务器错误',
                success: false
            };
        } else if (data.length > 0) {
            if (data[0].ADDACC == userAccount) {
                // 如果是自己写的文章，则直接返回文章内容
                message = {
                    code: 200,
                    data: {
                        articleContent: data[0].articleContent
                    },
                    message: '获取成功',
                    success: true
                };
            } else {
                const rolesId = await Article.getRoles(userAccount);
                const stateNum = data[0].stateNum;

                if (rolesId === 0) {
                    return {
                        code: 403,
                        data: {},
                        message: '服务器繁忙，请稍后再试',
                        success: false
                    };
                } else if (rolesId === 10003) {
                    // 普通用户只能查看对应权限的文章
                    if (stateNum === 2 || stateNum === 3) {
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
                            code: 503,
                            data: {},
                            message: '权限不足',
                            success: false
                        };
                    }

                } else if (rolesId === 10001 || rolesId === 10002) {
                    // 管理员可以查看所有文章内容
                    message = {
                        code: 200,
                        data: {
                            articleContent: data[0].articleContent
                        },
                        message: '获取成功',
                        success: true
                    };
                }
            }

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
        // 只有超级管理员可以删除任意文章，其他用户只能删除自己写的文章
        const rolesId = await Article.getRoles(userAccount);

        if (rolesId !== 10001) {
            const sqlStr = 'select ADDACC from articlelist where articleId = ? and isdelete = ?'

            const list = await Article.database.query(sqlStr, [id, 0]);

            if (list !== false && list.length > 0) {
                if (userAccount != list[0].ADDACC) {
                    return {
                        code: 503,
                        data: {},
                        message: '权限不足',
                        success: false
                    };
                }
            }
        }

        let curDate = new Date();
        let myDate = curDate.toLocaleDateString();
        let myTime = curDate.toTimeString().substr(0, 8);
        let delTime = myDate + ' ' + myTime;

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

    /**
     * @description 查询所有文章
     * @param {object} search {keyword, userAccount, currentPage, pageSize}
     * @returns {object} {code: 200, data: {articleId, articleTitle, author, categoryType, stateDes, ADDTIME, isdelete}, message: '成功', success: true}
     */
    static async queryAllArticle(search) {
        let {
            currentPage,
            pageSize,
            keyword,
            userAccount
        } = search;

        const rolesId = await Article.getRoles(userAccount);

        if (rolesId !== 10001 && rolesId !== 10002) {
            return {
                code: 503,
                data: {},
                message: '权限不足',
                success: false
            };
        }

        // 查询文章数量
        let queryNumber = `select count(articleId) as articleCount from articlelist `;

        if (typeof keyword === 'string' && keyword.trim().length > 0) {
            queryNumber += ` where articleTitle REGEXP '${keyword}' OR author REGEXP '${keyword}' OR addtime REGEXP '${keyword}'`;
        }

        let count = await Article.database.query(queryNumber, []);

        if (count !== false && count.length > 0) {
            count = count[0].articleCount;
        } else {
            return {
                code: 305,
                data: {},
                message: '未搜索到任何相关文章',
                success: true
            };
        }

        // 查询对应页码的文章
        if (isNaN(Number(currentPage))) {
            // 当前页码不为数字，则默认第一页
            currentPage = 1;
        } else {
            // 转为正整数
            currentPage = Math.abs(currentPage).toFixed();
        }

        if (isNaN(Number(pageSize))) {
            // 每页大小不为数字，则默认每页十条
            pageSize = 10;
        } else {
            // 转为正整数
            pageSize = Math.abs(pageSize).toFixed();
        }

        if ((currentPage - 1) * pageSize > count) {
            // 在当前页码超出范围时，设为默认值
            currentPage = 1;
            pageSize = 10;
        }

        // mysql语句: limit 每页条数 offset 起始位置   第一页从0开始，所以减一
        let pageSizeQuery = ` ORDER BY stateNum asc, articleId DESC limit ${pageSize} offset ${(currentPage - 1) * pageSize}`;
        let queryStr = `SELECT articleId, articleTitle, author, categoryType, stateDes, ADDTIME, isdelete from articlelist`;
        

        if (typeof keyword === 'string' && keyword.trim().length > 0) {
            queryStr += ` where articleTitle REGEXP '${keyword}' OR author REGEXP '${keyword}' OR addtime REGEXP '${keyword}'`;
        }
        queryStr += pageSizeQuery;

        const data = await Article.database.query(queryStr, []);
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
                message: '未搜索到任何相关文章',
                success: true
            };
        }

        return message;
    }

    /**
     * @description 审核文章，改变文章状态
     * @param {object} data {userAccount, articleId, stateNum}
     * @returns {*} {code: 200, data: {}, message: '成功', success: true}
     */
    static async checkArticle({
        userAccount,
        articleId,
        stateNum
    }) {
        const rolesId = await Article.getRoles(userAccount);

        if (rolesId !== 10001 && rolesId !== 10002) {
            return {
                code: 503,
                data: {},
                message: '权限不足',
                success: false
            };
        }

        const sqlStr = 'update articlestate set stateNum = ? where articleId = ?';

        const result = await Article.database.update(sqlStr, [stateNum, articleId]);

        let message = null;
        if (result) {
            message = {
                code: 200,
                data: {},
                message: '修改成功',
                success: true
            };
        } else {
            message = {
                code: 401,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 恢复文章
     * @param {object} param0 {userAccount, articleId}
     * @returns {*} {code: 200, data: {}, message: '成功', success: true}
     */
    static async reductionArticle({
        userAccount,
        articleId
    }) {
        const rolesId = await Article.getRoles(userAccount);

        if (rolesId !== 10001) {
            return {
                code: 503,
                data: {},
                message: '权限不足',
                success: false
            };
        }

        const curDate = new Date();
        const myDate = curDate.toLocaleDateString();
        const myTime = curDate.toTimeString().substr(0, 8);
        const updateTime = myDate + ' ' + myTime;

        const sqlStr = 'update articleinfo set UPDATEACC = ?, UPDATETIME = ?, ISDELETE = ? where articleId = ?';

        const result = await Article.database.update(sqlStr, [userAccount, updateTime, 0, articleId]);

        let message = null;
        if (result) {
            message = {
                code: 200,
                data: {},
                message: '修改成功',
                success: true
            };
        } else {
            message = {
                code: 401,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 修改分类名称
     * @param {object} param0 {userAccount, categoryId, categoryType}
     * @returns {*} {code: 200, data: {}, message: '成功', success: true}
     */
    static async updateCategory({
        userAccount,
        categoryId,
        categoryType
    }) {
        const rolesId = await Article.getRoles(userAccount);

        if (rolesId !== 10001) {
            return {
                code: 503,
                data: {},
                message: '权限不足',
                success: false
            };
        }

        const curDate = new Date();
        const myDate = curDate.toLocaleDateString();
        const myTime = curDate.toTimeString().substr(0, 8);
        const updateTime = myDate + ' ' + myTime;

        const sqlStr = 'update articlecategory set categoryType = ?, UPDATEACC = ?, UPDATETIME = ? where categoryId = ?';

        const result = await Article.database.update(sqlStr, [categoryType, userAccount, updateTime, categoryId]);

        let message = null;
        if (result) {
            message = {
                code: 200,
                data: {},
                message: '修改成功',
                success: true
            };
        } else {
            message = {
                code: 401,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 添加分类
     * @param {object} param0 {userAccount, categoryType}
     * @returns {*} {code: 200, data: {}, message: '成功', success: true}
     */
    static async addCategory({
        userAccount,
        categoryType
    }) {
        const rolesId = await Article.getRoles(userAccount);

        if (rolesId !== 10001) {
            return {
                code: 503,
                data: {},
                message: '权限不足',
                success: false
            };
        }

        const curDate = new Date();
        const myDate = curDate.toLocaleDateString();
        const myTime = curDate.toTimeString().substr(0, 8);
        const ADDTIME = myDate + ' ' + myTime;
        const ADDACC = userAccount;

        const sqlStr = 'insert into articlecategory set ?';

        const result = await Article.database.insert(sqlStr, {
            categoryType,
            ADDACC,
            ADDTIME
        });

        let message = null;
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
                message: '服务器繁忙，请稍后再试',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 删除分类
     * @param {object} param0 {userAccount, categoryId}
     * @returns {*} {code: 200, data: {}, message: '成功', success: true}
     */
    static async delCategory({
        userAccount,
        categoryId
    }) {
        const rolesId = await Article.getRoles(userAccount);

        if (rolesId !== 10001) {
            return {
                code: 503,
                data: {},
                message: '权限不足',
                success: false
            };
        }

        const curDate = new Date();
        const myDate = curDate.toLocaleDateString();
        const myTime = curDate.toTimeString().substr(0, 8);
        const delTime = myDate + ' ' + myTime;

        const sqlStr = 'update articlecategory set ISDELETE = ?, DELETEACC = ?, DELETETIME = ? where categoryId = ?';

        const result = await Article.database.update(sqlStr, [1, userAccount, delTime, categoryId]);

        let message = null;
        if (result) {
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
                message: '服务器繁忙，请稍后再试',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 查询所有文章评论
     * @param {object} search {currentPage, pageSize}
     * @returns {object} {code: 200, data: {comment: [commentId, commentContent, commentTime, articleTitle, auditor, stateDes], count}, message: '成功', success: true}
     */
    static async queryAllComment(search) {
        let {
            currentPage,
            pageSize,
            userAccount
        } = search;

        const rolesId = await Article.getRoles(userAccount);

        if (rolesId !== 10001 && rolesId !== 10002) {
            return {
                code: 503,
                data: {},
                message: '权限不足',
                success: false
            };
        }

        // 查询评论数量
        let queryNumber = 'select count(articleId) as commentCount from commentlist where isDelete = ?';
        let count = await Article.database.query(queryNumber, [0]);

        if (count !== false && count.length > 0) {
            count = count[0].commentCount;
        }

        // 查询对应页码的文章
        if (isNaN(Number(currentPage))) {
            // 当前页码不为数字，则默认第一页
            currentPage = 1;
        } else {
            // 转为正整数
            currentPage = Math.abs(currentPage).toFixed();
        }

        if (isNaN(Number(pageSize))) {
            // 每页大小不为数字，则默认每页十条
            pageSize = 10;
        } else {
            // 转为正整数
            pageSize = Math.abs(pageSize).toFixed();
        }

        if ((currentPage - 1) * pageSize > count) {
            // 在当前页码超出范围时，设为默认值
            currentPage = 1;
            pageSize = 10;
        }

        // mysql语句: limit 每页条数 offset 起始位置   第一页从0开始，所以减一
        let queryStr = `SELECT commentId, commentContent, commentTime, articleTitle, auditor, stateDes from commentlist where 
        isDelete = ? ORDER BY commentId DESC limit ${pageSize} offset ${(currentPage - 1) * pageSize}`;

        const data = await Article.database.query(queryStr, [0]);
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
                    comment: data,
                    count
                },
                message: '获取成功',
                success: true
            };

        } else {
            message = {
                code: 305,
                data: {},
                message: '评论列表获取失败',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 删除评论
     * @param {object} param0 {userAccount, commentId}
     * @returns {*} {code: 200, data: {}, message: '成功', success: true}
     */
    static async delComment({
        userAccount,
        commentId
    }) {
        const rolesId = await Article.getRoles(userAccount);

        if (rolesId !== 10001) {
            return {
                code: 503,
                data: {},
                message: '权限不足',
                success: false
            };
        }

        const curDate = new Date();
        const myDate = curDate.toLocaleDateString();
        const myTime = curDate.toTimeString().substr(0, 8);
        const delTime = myDate + ' ' + myTime;

        const sqlStr = 'update comment set ISDELETE = ?, DELETEACC = ?, DELETETIME = ? where commentId = ?';

        const result = await Article.database.update(sqlStr, [1, userAccount, delTime, commentId]);

        let message = null;
        if (result) {
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
                message: '服务器繁忙，请稍后再试',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 评论审核
     * @param {object} param0 {userAccount, commentId, stateId}
     * @returns {*} {code: 200, data: {}, message: '成功', success: true}
     */
    static async checkComment({
        userAccount,
        commentId,
        stateId
    }) {
        const rolesId = await Article.getRoles(userAccount);

        if (rolesId !== 10001 && rolesId !== 10002) {
            return {
                code: 503,
                data: {},
                message: '权限不足',
                success: false
            };
        }

        const curDate = new Date();
        const myDate = curDate.toLocaleDateString();
        const myTime = curDate.toTimeString().substr(0, 8);
        const checkTime = myDate + ' ' + myTime;

        const sqlStr = 'update commentcheckstate set stateId = ?, checkACC = ?, checkTime = ? where commentId = ?';

        const result = await Article.database.update(sqlStr, [stateId, userAccount, checkTime, commentId]);

        let message = null;
        if (result) {
            message = {
                code: 200,
                data: {},
                message: '审核成功',
                success: true
            };
        } else {
            message = {
                code: 401,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 查询留言列表
     * @param {object} search {currentPage, pageSize}
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async getMessageList(search) {
        let {
            currentPage,
            pageSize,
            userAccount
        } = search;

        const rolesId = await Article.getRoles(userAccount);

        if (rolesId !== 10001 && rolesId !== 10002) {
            return {
                code: 503,
                data: {},
                message: '权限不足',
                success: false
            };
        }

        // 查询留言数量
        let queryNumber = 'select count(msgId) as msgCount from messagelist where isDelete = ?';
        let count = await Article.database.query(queryNumber, [0]);

        if (count !== false && count.length > 0) {
            count = count[0].msgCount;
        } else {
            count = 0;
        }

        if (isNaN(Number(currentPage))) {
            // 当前页码不为数字，则默认第一页
            currentPage = 1;
        } else {
            // 转为正整数
            currentPage = Math.abs(currentPage).toFixed();
        }

        if (isNaN(Number(pageSize))) {
            // 每页大小不为数字，则默认每页十条
            pageSize = 10;
        } else {
            // 转为正整数
            pageSize = Math.abs(pageSize).toFixed();
        }

        if ((currentPage - 1) * pageSize > count) {
            // 在当前页码超出范围时，设为默认值
            currentPage = 1;
            pageSize = 10;
        }

        // mysql语句: limit 每页条数 offset 起始位置   第一页从0开始，所以减一
        let queryStr = `SELECT msgId, msgContent, addTime, checkAcc, checkTime, stateDes from messagelist where 
            isDelete = ? ORDER BY msgId DESC limit ${pageSize} offset ${(currentPage - 1) * pageSize}`;

        const data = await Article.database.query(queryStr, [0]);
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
                    messageList: data,
                    count
                },
                message: '获取成功',
                success: true
            };

        } else {
            message = {
                code: 305,
                data: {},
                message: '评论列表获取失败',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 删除评论
     * @param {object} param0 {userAccount, msgId}
     * @returns {*} {code: 200, data: {}, message: '成功', success: true}
     */
    static async delMessage({
        userAccount,
        msgId
    }) {
        const rolesId = await Article.getRoles(userAccount);

        if (rolesId !== 10001) {
            return {
                code: 503,
                data: {},
                message: '权限不足',
                success: false
            };
        }

        const curDate = new Date();
        const myDate = curDate.toLocaleDateString();
        const myTime = curDate.toTimeString().substr(0, 8);
        const delTime = myDate + ' ' + myTime;

        const sqlStr = 'update message set ISDELETE = ?, DELETEACC = ?, DELETETIME = ? where msgId = ?';

        const result = await Article.database.update(sqlStr, [1, userAccount, delTime, msgId]);

        let message = null;
        if (result) {
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
                message: '服务器繁忙，请稍后再试',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 留言审核
     * @param {object} param0 {userAccount, commentId, stateId}
     * @returns {*} {code: 200, data: {}, message: '成功', success: true}
     */
    static async checkMessage({
        userAccount,
        msgId,
        stateId
    }) {
        const rolesId = await Article.getRoles(userAccount);

        if (rolesId !== 10001 && rolesId !== 10002) {
            return {
                code: 503,
                data: {},
                message: '权限不足',
                success: false
            };
        }

        const curDate = new Date();
        const myDate = curDate.toLocaleDateString();
        const myTime = curDate.toTimeString().substr(0, 8);
        const checkTime = myDate + ' ' + myTime;

        const sqlStr = 'update messagecheck set stateId = ?, checkACC = ?, checkTime = ? where msgId = ?';

        const result = await Article.database.update(sqlStr, [stateId, userAccount, checkTime, msgId]);

        let message = null;
        if (result) {
            message = {
                code: 200,
                data: {},
                message: '审核成功',
                success: true
            };
        } else {
            message = {
                code: 401,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 热门文章列表
     * @returns {object} {code: 200, data: {articleId, articleTitle, author, addTime, hot}, message: '成功', success: true}
     */
    static async blogHotArticles() {
        // 查询用户可以看见的文章并按热度排序
        const queryStr = `SELECT articleId, articleTitle, author, ADDTIME as addTime, hot, categoryType from articlelist 
        where isdelete = ? and stateNum = ? ORDER BY hot DESC limit 10`;

        const data = await Article.database.query(queryStr, [0, 3]);
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
                    articles: data
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
     * @description 最新文章列表
     * @param {object} data {currentPage, pageSize, categoryType}
     * @returns {object} {code: 200, data: {articleId, articleTitle, author, addTime, hot}, message: '成功', success: true}
     */
    static async blogNewArticles({
        currentPage,
        pageSize,
        categoryType
    }) {
        // 查询用户可以看见的文章并按id排序  mysql语句: limit 每页条数 offset 起始位置   第一页从0开始，所以减一
        let queryStr = `SELECT articleId, articleTitle, author, ADDTIME as addTime, hot, categoryType from articlelist where  
        isdelete = ? and stateNum = ? `;

        const sqlStr = 'and categoryType = ? ';
        const splitSql = ` ORDER BY articleId DESC  limit ${pageSize} offset ${(currentPage - 1) * pageSize}`;

        if (categoryType) {
            queryStr += (sqlStr + splitSql);
        } else {
            queryStr += splitSql;
        }

        const data = await Article.database.query(queryStr, [0, 3, categoryType]);
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
                    articles: data
                },
                message: '获取成功',
                success: true
            };

        } else {
            message = {
                code: 305,
                data: {},
                message: '没有更多文章了',
                success: true
            };
        }

        return message;
    }

    /**
     * @description 获取文章内容
     * @param {number} articleId
     * @returns {object} {code: 200, data: {articleContent}, message: '成功', success: true}
     */
    static async blogArticleContent(articleId) {
        // 查询用户可以看见的文章内容
        const queryStr = 'SELECT articleContent, hot from articlelist where isdelete = ? and articleId = ? and stateNum = ?';

        const data = await Article.database.query(queryStr, [0, articleId, 3]);
        let message = {};

        if (data === false) {
            message = {
                code: 401,
                data: {},
                message: '服务器错误',
                success: false
            };
        } else if (data.length > 0) {
            // 文章热度加一
            const sqlStr = 'update articleinfo set articleHot = ? where articleId = ?';
            Article.database.update(sqlStr, [Number(data[0].hot) + 1, articleId]);

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
                message: '文章内容获取失败',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 获取文章评论列表
     * @param {number} articleId
     * @returns {object} {code: 200, data: {commentList}, message: '成功', success: true}
     */
    static async blogCommentList(articleId) {
        // 查询该文章下审核通过的审核列表
        const queryStr = `SELECT commentId, commentContent, commentTime, parentId, replyId from commentlist
        where isdelete = ? and articleId = ? and stateDes = ?`;

        const data = await Article.database.query(queryStr, [0, articleId, '审核通过']);
        let message = {};

        if (data === false) {
            message = {
                code: 401,
                data: {},
                message: '服务器错误',
                success: false
            };
        } else if (data.length > 0) {
            // 筛选出所有的主评论
            const commentList = data.filter((item) => item.parentId === null).map((item) => {
                return {
                    commentId: item.commentId,
                    commentContent: item.commentContent,
                    commentTime: item.commentTime
                };
            });

            // 将子评论添加到对应的主评论下
            data.forEach((item) => {
                if (item.parentId !== null) {
                    const index = commentList.findIndex((value) => value.commentId === item.parentId);

                    let children = commentList[index].children || [];

                    children.push(item);
                    commentList[index].children = children;
                }
            });

            message = {
                code: 200,
                data: {
                    commentList
                },
                message: '获取成功',
                success: true
            };
        } else {
            message = {
                code: 205,
                data: {
                    commentList: []
                },
                message: '该文章没有任何评论',
                success: true
            };
        }

        return message;
    }

    /**
     * @description 搜索文章
     * @param {string} keyword
     * @returns {object} {code: 200, data: {articles: [{articleId, articleTitle}]}, message: '成功', success: true}
     */
    static async blogSearchArticle(keyword) {
        // 模糊查询文章
        const sqlStr = `SELECT articleId, articleTitle from (SELECT articleId, articleTitle, author, addtime 
            FROM articlelist WHERE isdelete = ? and stateNum = ?) AS new WHERE articleTitle REGEXP '${keyword}' 
            OR author REGEXP '${keyword}' OR addtime REGEXP '${keyword}' limit 10`;

        const data = await Article.database.query(sqlStr, [0, 3]);
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
                    articles: data
                },
                message: '获取成功',
                success: true
            };

        } else {
            message = {
                code: 305,
                data: {},
                message: '没有相关文章',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 发表评论
     * @param {string} data {articleId, commentContent, parentId, replyId}
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async blogAddComment({
        articleId,
        commentContent,
        parentId,
        replyId
    }) {
        let message = null;
        let data = null;

        data = await Article.database.insertComment({
            articleId,
            commentContent,
            parentId,
            replyId
        });

        if (data) {
            message = {
                code: 200,
                data: {},
                message: '发表评论成功，审核中',
                success: true
            };
        } else {
            message = {
                code: 401,
                data: {},
                message: '发表评论失败',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 留言
     * @param {string} msgContent
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async blogAddMessage(msgContent) {
        let message = null;

        const sqlStr = `insert into message set ?`;

        const curDate = new Date();
        const myDate = curDate.toLocaleDateString();
        const myTime = curDate.toTimeString().substr(0, 8);
        const addTime = myDate + ' ' + myTime;

        const data = await Article.database.insert(sqlStr, {
            msgContent,
            addTime
        });

        if (data) {
            message = {
                code: 200,
                data: {},
                message: '留言成功，审核中',
                success: true
            };
        } else {
            message = {
                code: 401,
                data: {},
                message: '留言失败',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 查询留言
     * @param {object} search {currentPage, pageSize}
     * @returns {object} {code: 200, data: {messageList: [{msgContent, addTime}]}, message: '成功', success: true}
     */
    static async queryMessage({
        currentPage,
        pageSize
    }) {

        if (isNaN(Number(currentPage))) {
            // 当前页码不为数字，则默认第一页
            currentPage = 1;
        } else {
            // 转为正整数
            currentPage = Math.abs(currentPage).toFixed();
        }

        if (isNaN(Number(pageSize))) {
            // 每页大小不为数字，则默认每页十条
            pageSize = 10;
        } else {
            // 转为正整数
            pageSize = Math.abs(pageSize).toFixed();
        }

        // mysql语句: limit 每页条数 offset 起始位置   第一页从0开始，所以减一
        let queryStr = `SELECT msgContent, addTime from messagelist where isDelete = ? and stateDes = ? 
        ORDER BY addTime DESC limit ${pageSize} offset ${(currentPage - 1) * pageSize}`;

        const data = await Article.database.query(queryStr, [0, '审核通过']);
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
                    messageList: data,
                },
                message: '获取成功',
                success: true
            };

        } else {
            message = {
                code: 305,
                data: {},
                message: '没有任何留言',
                success: true
            };
        }

        return message;
    }

    /**
     * @description 获取文章分类
     * @returns {object} {code: 200, data: {categories: [{categoryType}]}, message: '成功', success: true}
     */
    static async queryCategory() {
        const queryStr = 'SELECT categoryType from articlecategory WHERE ISDELETE = ?';

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
     * @description 修改文章
     * @param {object} data {articleId, articleTitle, articleContent, categoryId, userAccount}
     * @returns {object} {code: 200, data: {}, message: '', success: true}
     */
    static async updateArticle(data) {
        const message = {
            code: 200,
            data: {},
            message: '修改成功',
            success: true
        };

        let {
            articleId,
            articleTitle,
            articleContent,
            categoryId,
            userAccount
        } = data;
        let errorInfo = '';

        // 只有超级管理员可以修改任意文章，其他用户只能修改自己写的文章
        const rolesId = await Article.getRoles(userAccount);

        if (rolesId !== 10001) {
            const sqlStr = 'select ADDACC from articlelist where articleId = ? and isdelete = ?'

            const list = await Article.database.query(sqlStr, [articleId, 0]);

            if (list !== false && list.length > 0) {
                if (userAccount != list[0].ADDACC) {
                    return {
                        code: 503,
                        data: {},
                        message: '权限不足',
                        success: false
                    };
                }
            }
        }

        // 修改后的文章需要重新审核
        const stateStr = 'update articlestate set stateNum = ? where articleId = ?';
        const value = await Article.database.update(stateStr, [1, articleId]);

        if (!value) {
            return {
                code: 401,
                data: {},
                message: '修改失败',
                success: false
            };
        }

        // 修改文章分类
        if (categoryId != undefined) {
            const sqlStr = 'update articletype set categoryId = ? where articleId = ?';

            const data = await Article.database.update(sqlStr, [categoryId, articleId]);

            if (!data) {
                errorInfo = '文章分类修改失败';

                message.code = 401;
                message.success = false;
                message.message = errorInfo;
            }
        }

        // 修改文章内容、标题
        if (articleContent || articleTitle) {
            let curDate = new Date();
            let myDate = curDate.toLocaleDateString();
            let myTime = curDate.toTimeString().substr(0, 8);
            let updateTime = myDate + ' ' + myTime;
            let data = [];

            let commonStr = 'update articleinfo set ';

            if (articleTitle != undefined) {
                commonStr += 'articleTitle = ?, ';
                data.push(articleTitle);
            }

            if (articleContent != undefined) {
                commonStr += 'articleContent = ?, ';
                data.push(articleContent);
            }

            commonStr += 'UPDATEACC = ?, UPDATETIME = ? WHERE articleId = ?';
            data.push(userAccount);
            data.push(updateTime);
            data.push(articleId);

            const success = await Article.database.update(commonStr, data);

            if (!success) {
                if (errorInfo == '') {
                    message.code = 401;
                    message.success = false;
                    message.message = '文章标题或文章内容修改失败';
                } else {
                    message.message = '修改失败';
                }
            }
        }

        return message;
    }
}

module.exports = {
    getArticleCategory: Article.getArticleCategory,
    addArticle: Article.addArticle,
    queryArticleList: Article.queryArticleList,
    queryArticleContent: Article.queryArticleContent,
    delArticle: Article.delArticle,
    queryAllArticle: Article.queryAllArticle,
    checkArticle: Article.checkArticle,
    reductionArticle: Article.reductionArticle,
    updateCategory: Article.updateCategory,
    addCategory: Article.addCategory,
    delCategory: Article.delCategory,
    queryAllComment: Article.queryAllComment,
    delComment: Article.delComment,
    checkComment: Article.checkComment,
    getMessageList: Article.getMessageList,
    delMessage: Article.delMessage,
    checkMessage: Article.checkMessage,
    blogHotArticles: Article.blogHotArticles,
    blogNewArticles: Article.blogNewArticles,
    blogArticleContent: Article.blogArticleContent,
    blogCommentList: Article.blogCommentList,
    blogSearchArticle: Article.blogSearchArticle,
    blogAddComment: Article.blogAddComment,
    blogAddMessage: Article.blogAddMessage,
    queryMessage: Article.queryMessage,
    queryCategory: Article.queryCategory,
    updateArticle: Article.updateArticle
};