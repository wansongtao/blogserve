/**
 * @description 逻辑模块
 * @author wansongtao
 * @date 2020-12-08
 */
class Process {
    static users = require('./users');
    static token = require('../../token');
    static uploadFile = require('./uploadFile');
    static article = require('./article');
    static untils = require('../../untils/untils');

    /**
     * @description 获取用户账号，根据token
     * @param {object} req 请求对象
     * @returns {object} 返回 {code: 200, userAccount} 获取失败时userAccount为null
     */
    static _getUserAccount_(req) {
        let token = '';
        const message = {
            code: 400,
            userAccount: null
        };

        try {
            if (req.query.token != undefined) {
                // 如果传了token参数，则直接获取token的值。
                token = req.query.token;
            } else if (req.headers.authorization != undefined) {
                // 如果没有传token参数，则从请求头里获取token字符串。
                token = req.headers.authorization;
            } else if (req.cookies.authorization != undefined) {
                // 如果请求头里也没有token，则从cookies中获取token。
                token = req.cookies.authorization;
            } else {
                // token获取失败
                return {
                    code: 300,
                    userAccount: null,
                };
            }

            // 因为前端传过来的token前面加上了‘Bearer’，具体格式为：'Bearer ' + token
            token = token.split(' ')[1];
            const backVal = this.token.verifyToken(token);

            if (backVal === 0) {
                // token超时
                message.code = 500;
            } else if (backVal === -1) {
                // 用户在其他地方登录了
                message.code = 501;
            } else if (backVal === -2) {
                // token错误
                message.code = 300;
            } else {
                // 获取账号成功
                message.code = 200;
                message.userAccount = backVal;
            }
        } catch (ex) {
            console.error('class Process => _getUserAccount_(): ', ex.message);
        } finally {
            return message;
        }
    }

    /**
     * @description 用户登录
     * @param {*} req 请求对象 {userAccount, userPassword} = req.body
     * @param {*} res 响应对象
     * @returns {object} {code: 200, data: {token}, message: '登录成功', success: true}
     */
    static async login(req, res) {
        let {
            userAccount,
            userPassword
        } = req.body;

        // 验证账号密码的数据类型
        const isVerify = Process.untils.verifyParams([{
            value: userAccount,
            type: 'string'
        }, {
            value: userPassword,
            type: 'string'
        }]);

        // 类型错误，直接返回信息
        if (!isVerify) {
            res.send({
                code: 300,
                data: {},
                message: '请求参数类型错误',
                success: false
            });
            return;
        }

        // 验证账号密码的格式
        const isFormat = Process.untils.verifyFormat([{
                value: userAccount,
                regExp: /^[a-zA-Z][\w]{1,5}$/
            },
            {
                value: userPassword,
                regExp: /^[a-zA-Z][\w\.\?!]{5,15}$/
            }
        ]);

        // 格式错误，直接返回信息
        if (!isFormat) {
            res.send({
                code: 302,
                data: {},
                message: '账号或密码格式错误',
                success: false
            });
            return;
        }

        // 查询是否有该用户，密码是否正确
        const message = await Process.users.queryUser({
            userAccount,
            userPassword
        });

        res.send(message);
    }

    /**
     * @description 获取用户信息
     * @param {*} req 
     * @param {*} res 
     * @returns {object} {code: 200, data: {name,avatar,roles}, message: '登录成功', success: true}
     */
    static async getUserInfo(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        const backVal = Process._getUserAccount_(req);

        if (backVal.userAccount) {
            message = await Process.users.queryUserInfo(backVal.userAccount);
        } else {
            message.code = backVal.code;
        }

        res.send(message);
    }

    /**
     * @description 用户登出，删除保存的用户信息
     * @param {*} req 请求对象
     * @param {*} res 响应对象
     * @returns  {object} {code: 200, data: {}, message: '登出成功', success: true}
     */
    static async logout(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        const backVal = Process._getUserAccount_(req);


        if (backVal.userAccount) {
            // 成功获取用户账号后，删除用户登录信息
            message = await Process.users.clearTokenUserInfo(backVal.userAccount);
        } else {
            message.code = backVal.code;
        }

        res.send(message);
    }

    /**
     * @description 图片上传
     * @param {*} req 
     * @param {*} res 
     * @returns {object} {code: 200, data: {imgUrl}, message: '成功', success: true}
     */
    static async uploadImg(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        const backVal = Process._getUserAccount_(req);

        if (backVal.userAccount) {
            message = await Process.uploadFile.saveImage(req);
        } else {
            message.code = backVal.code;
        }

        res.send(message);
    }

    /**
     * @description 修改用户信息
     * @param {*} req 
     * @param {*} res 
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async editUserInfo(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        const backVal = Process._getUserAccount_(req);

        if (backVal.userAccount) {
            let userInfo = req.body;

            const isVerify = Process.untils.verifyParams([{
                value: userInfo,
                type: 'object'
            }]);

            if (!isVerify) {
                message.code = 300;
                res.send(message);
                return;
            }

            // 没有修改任何信息
            if (Object.values(userInfo).length === 0) {
                message.code = 300;
                message.message = '您没有修改任何信息';
                res.send(message);
                return;
            }

            // 校验参数格式
            let isFormat = Object.entries(userInfo).every((item) => {
                let returnVal = true;
                const key = item[0];
                const value = item[1];

                if (key === 'userName') {
                    returnVal = /^[\u4e00-\u9fa5]{1,8}$/.test(value);
                } else if (key === 'userGender') {
                    returnVal = /^[01]$/.test(value);
                } else if (key === 'birthday') {
                    returnVal = /^[1-9]{4}-[01][0-9]-[0-9]{2}$/.test(value);
                } else if (key === 'qqAcc') {
                    returnVal = /^[1-9][0-9]{4,10}$/.test(value);
                } else if (key === 'email') {
                    returnVal = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value);
                } else if (key === 'lifeMotto') {
                    returnVal = /^[\u4e00-\u9fa5，,。\.]{1,50}$/.test(value);
                } else if (key === 'hobby') {
                    returnVal = Array.isArray(value);
                }

                return returnVal;
            });

            if (!isFormat) {
                message.code = 300;
                res.send(message);
                return;
            }

            message = await Process.users.updateUserInfo({
                userAccount: backVal.userAccount,
                userInfo
            });

        } else {
            message.code = backVal.code;
        }

        res.send(message);
    }

    /**
     * @description 获取文章分类
     * @param {*} req 
     * @param {*} res 
     * @returns {object} {code: 200, data: {categories: [{categoryId: 100, categoryType: "文学"}]}, message: '成功', success: true}
     */
    static async getCategory(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        const backVal = Process._getUserAccount_(req);

        if (backVal.userAccount) {
            message = await Process.article.getArticleCategory();
        } else {
            message.code = backVal.code;
        }

        res.send(message);
    }

    /**
     * @description 添加文章
     * @param {*} req 
     * @param {*} res 
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async addArticle(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        const backVal = Process._getUserAccount_(req);

        if (backVal.userAccount) {
            let {
                articleTitle,
                articleContent,
                categoryId
            } = req.body;

            const isVerify = Process.untils.verifyParams([
                {
                    value: articleTitle,
                    type: 'string'
                },
                {
                    value: articleContent,
                    type: 'string'
                },
                {
                    value: categoryId,
                    type: 'number'
                }
            ]);

            if (!isVerify) {
                message.code = 300;
                res.send(message);
                return;
            }

            message = await Process.article.addArticle({
                userAccount: backVal.userAccount,
                articleTitle,
                articleContent,
                categoryId
            });
        } else {
            message.code = backVal.code;
        }

        res.send(message);
    }

    /**
     * @description 获取文章列表
     * @param {*} req {currentPage, pageSize}
     * @param {*} res 
     * @returns {object} {code: 200, data: {articles: [{articleId, articleTitle, author, categoryType, ADDTIME}], count}, message: '成功', success: true}
     */
    static async getArticleList(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        const backVal = Process._getUserAccount_(req);
        let {currentPage, pageSize} = req.query;

        if (backVal.userAccount) {
            message = await Process.article.queryArticleList({userAccount: backVal.userAccount, currentPage, pageSize});
        } else {
            message.code = backVal.code;
        }

        res.send(message);
    }

    /**
     * @description 获取文章内容
     * @param {*} req {id: 文章id}
     * @param {*} res 
     * @returns {object} {code: 200, data: {articleContent}, message: '成功', success: true}
     */
    static async queryArticleContent(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        const backVal = Process._getUserAccount_(req);

        if (backVal.userAccount) {
            if (Process.untils.verifyParams([{value: Number(req.query.id), type: 'number'}])) {
                message = await Process.article.queryArticleContent(req.query.id, backVal.userAccount);
            }
            else {
                message.code = 300;
            }
            
        } else {
            message.code = backVal.code;
        }

        res.send(message);
    }

    /**
     * @description 删除文章
     * @param {*} req {id: 文章id}
     * @param {*} res 
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async delArticle(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        const backVal = Process._getUserAccount_(req);

        if (backVal.userAccount) {
            if (Process.untils.verifyParams([{value: Number(req.query.id), type: 'number'}])) {
                message = await Process.article.delArticle({
                    id: req.query.id,
                    userAccount: backVal.userAccount
                });
            }
            else {
                message.code = 300;
            }
            
        } else {
            message.code = backVal.code;
        }

        res.send(message)
    }
}

module.exports = {
    login: Process.login,
    getUserInfo: Process.getUserInfo,
    logout: Process.logout,
    uploadImg: Process.uploadImg,
    editUserInfo: Process.editUserInfo,
    getCategory: Process.getCategory,
    addArticle: Process.addArticle,
    getArticleList: Process.getArticleList,
    queryArticleContent: Process.queryArticleContent,
    delArticle: Process.delArticle
};