/**
 * @description 逻辑模块
 * @author 万松涛
 * @date 2020-12-08
 */
class Process {
    static users = require('./users');
    static token = require('../token');
    static uploadFile = require('./uploadFile');
    static article = require('./article');
    static untils = require('../untils/untils');

    /**
     * @description 根据token获取用户账号
     * @param {object} req 请求对象
     * @returns {object} 返回 {code: 200, userAccount, message} 获取失败时userAccount为null
     */
    static _getUserAccount_(req) {
        const message = {
            code: 400,
            userAccount: null,
            message: '服务器繁忙，请稍后再试'
        };

        try {
            let token = '';

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
                    message: '获取token失败'
                };
            }

            // 因为前端传过来的token前面加上了‘Bearer’，具体格式为：'Bearer ' + token
            token = token.split(' ')[1];
            const backVal = this.token.verifyToken(token);

            if (backVal === 0) {
                // token超时
                message.code = 500;
                message.message = '用户身份过期，请重新登录';
            } else if (backVal === -1) {
                // 用户在其他地方登录了
                message.code = 501;
                message.message = '该账号已在别的地方登录，请确认密码是否泄露？如已泄露，请通知管理员。';
            } else if (backVal === -2) {
                // token错误
                message.code = 300;
                message.message = 'token错误。';
            } else {
                // 获取账号成功
                message.code = 200;
                message.userAccount = backVal;
                message.message = 'token正确，获取用户账号成功';
            }
        } catch (ex) {
            console.error('class Process => _getUserAccount_(): ', ex.message);
        } finally {
            return message;
        }
    }

    /**
     * @description 验证返回值是否有code、message、success三个必要属性且是否符合规范
     * @param {object} val 返回值
     * @returns 通过返回true，失败返回false
     */
    static _verifyBackValue_(val) {
        try {
            let backVal = false;

            if (val instanceof Object && val.code != undefined && val.message != undefined && val.success != undefined) {
                const {
                    code,
                    message,
                    success
                } = val;

                if (/^[1-9][0-9]{2}$/.test(code) && (typeof message === 'string' && message.length > 0) && (success === true || success === false)) {
                    backVal = true;
                }
            }

            return backVal;
        } catch (ex) {
            console.error('class Process => _verifyBackValue_(): ', ex.message);
            return false;
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

        // 验证账号密码的格式
        const isFormat = Process.untils.verifyFormat([{
            value: userAccount,
            regExp: /^[a-zA-Z][\w]{1,5}$/
        }]);

        // 格式错误，直接返回信息
        if (!isFormat && (typeof userPassword !== 'string' || userPassword.length === 0)) {
            res.send({
                code: 302,
                data: {},
                message: '账号或密码格式错误',
                success: false
            });
            return;
        }

        // 查询是否有该用户，密码是否正确
        const message = await Process.users.login({
            userAccount,
            userPassword
        });

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
        
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
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
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
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
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
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
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
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 获取文章分类
     * @param {*} req 
     * @param {*} res 
     * @returns {object} {code: 200, data: {categories: [{categoryId, categoryType, ADDACC, ADDTIME}]}, message: '成功', success: true}
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
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
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

            const isVerify = Process.untils.verifyParams([{
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
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 获取文章列表
     * @param {*} req {keyword, currentPage, pageSize}
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
        let {
            keyword,
            currentPage,
            pageSize
        } = req.query;

        if (backVal.userAccount) {
            message = await Process.article.queryArticleList({
                userAccount: backVal.userAccount,
                currentPage,
                pageSize,
                keyword
            });
        } else {
            message.code = backVal.code;
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
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
            if (Process.untils.verifyParams([{
                    value: Number(req.query.id),
                    type: 'number'
                }])) {
                message = await Process.article.queryArticleContent(req.query.id, backVal.userAccount);
            } else {
                message.code = 300;
                message.message = backVal.message;
            }

        } else {
            message.code = backVal.code;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
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
            if (Process.untils.verifyParams([{
                    value: Number(req.query.id),
                    type: 'number'
                }])) {
                message = await Process.article.delArticle({
                    id: req.query.id,
                    userAccount: backVal.userAccount
                });
            } else {
                message.code = 300;
                message.message = backVal.message;
            }

        } else {
            message.code = backVal.code;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 获取用户列表
     * @param {*} req {currentPage, pageSize}
     * @param {*} res 
     * @returns {Promise} {code: 200, data: {userList: [{userAccount, powerName, userName, userGender}], count: 0}, message: '成功', success: true}
     */
    static async getUserList(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        const backVal = Process._getUserAccount_(req);

        if (backVal.userAccount) {
            let {
                currentPage,
                pageSize
            } = req.query;

            if (isNaN(Number(currentPage)) || isNaN(Number(pageSize))) {
                message.code = 300;
            } else {
                currentPage = Math.abs(Number(currentPage)).toFixed();
                pageSize = Math.abs(Number(pageSize)).toFixed();

                message = await Process.users.getUserList({
                    userAccount: backVal.userAccount,
                    currentPage,
                    pageSize
                });
            }
        } else {
            message.code = backVal.code;
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 删除用户
     * @param {*} req {userAccount}
     * @param {*} res 
     * @returns {Promise} {code: 200, data: {}, message: '成功', success: true}
     */
    static async delUser(req, res) {
        let {
            userAccount
        } = req.body;

        // 验证账号密码的数据类型
        const isVerify = Process.untils.verifyParams([{
            value: userAccount,
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

        // 验证账号的格式
        const isFormat = Process.untils.verifyFormat([{
            value: userAccount,
            regExp: /^[a-zA-Z][\w]{1,5}$/
        }]);

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

        const backVal = Process._getUserAccount_(req);

        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        if (backVal.userAccount) {
            message = await Process.users.delUser({
                userAccount,
                adminAccount: backVal.userAccount
            });
        } else {
            message.code = backVal.code;
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 重置用户密码
     * @param {*} req {userAccount}
     * @param {*} res 
     * @returns {Promise} {code: 200, data: {}, message: '成功', success: true}
     */
    static async resetUser(req, res) {
        let {
            userAccount
        } = req.body;

        // 验证账号密码的数据类型
        const isVerify = Process.untils.verifyParams([{
            value: userAccount,
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

        // 验证账号的格式
        const isFormat = Process.untils.verifyFormat([{
            value: userAccount,
            regExp: /^[a-zA-Z][\w]{1,5}$/
        }]);

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

        const backVal = Process._getUserAccount_(req);

        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        if (backVal.userAccount) {
            message = await Process.users.resetUserPwd({
                userAccount,
                adminAccount: backVal.userAccount
            });
        } else {
            message.code = backVal.code;
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 获取权限列表
     * @param {*} req 
     * @param {*} res 
     * @returns {Promise} {code: 200, data: {powerList: [{powerId, powerName}]}, message: '成功', success: true}
     */
    static async getPowerList(req, res) {
        const backVal = Process._getUserAccount_(req);

        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        if (backVal.userAccount) {
            message = await Process.users.getPowerList(backVal.userAccount);
        } else {
            message.code = backVal.code;
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 添加用户
     * @param {*} req {userAccount, powerId, userName, userGender}
     * @param {*} res 
     * @returns {Promise} {code: 200, data: {}, message: '成功', success: true}
     */
    static async addUser(req, res) {
        let {
            userAccount,
            powerId,
            userName,
            userGender
        } = req.body;

        // 校验参数格式
        const isFormat = Process.untils.verifyFormat([{
                value: userAccount,
                regExp: /^[a-zA-Z][\w]{1,5}$/
            },
            {
                value: userName,
                regExp: /^[\u4e00-\u9fa5]{1,8}$/
            },
            {
                value: powerId,
                regExp: /^[1][0-9]{4}$/
            },
            {
                value: userGender,
                regExp: /^[01]$/,
            }
        ]);

        if (!isFormat) {
            res.send({
                code: 300,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            });
            return;
        }

        const backVal = Process._getUserAccount_(req);

        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        if (backVal.userAccount) {
            message = await Process.users.addUser({
                userAccount,
                powerId,
                userName,
                userGender,
                adminAccount: backVal.userAccount
            });
        } else {
            message.code = backVal.code;
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 修改密码
     * @param {*} req 请求对象 {oldPassword, newPassword} = req.body
     * @param {*} res 响应对象
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async updatePwd(req, res) {
        let {
            pwd
        } = req.body;

        if (typeof pwd !== 'string' || pwd.length === 0) {
            return {
                code: 300,
                data: {},
                message: '参数错误',
                success: false
            };
        }

        const backVal = Process._getUserAccount_(req);

        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        if (backVal.userAccount) {
            message = await Process.users.updatePwd({
                pwd,
                userAccount: backVal.userAccount
            });
        } else {
            message.code = backVal.code;
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 获取所有文章
     * @param {*} req {keyword, currentPage, pageSize}
     * @param {*} res 
     * @returns {object} {code: 200, data: {articles: [{articleId, articleTitle, author, categoryType, stateDes, ADDTIME, isdelete}], count}, message: '成功', success: true}
     */
    static async getAllArticle(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        const backVal = Process._getUserAccount_(req);
        let {
            currentPage,
            pageSize,
            keyword
        } = req.query;

        if (backVal.userAccount) {
            message = await Process.article.queryAllArticle({
                userAccount: backVal.userAccount,
                currentPage,
                pageSize,
                keyword
            });
        } else {
            message.code = backVal.code;
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 文章审核
     * @param {*} req {articleId, stateNum} = req.body
     * @param {*} res 
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async checkArticle(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        let {
            articleId,
            stateNum
        } = req.body;

        const isVerify = Process.untils.verifyParams([{
                value: articleId,
                type: 'number'
            },
            {
                value: stateNum,
                type: 'number'
            }
        ]);

        if (!isVerify) {
            res.send({
                code: 300,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            });
            return;
        }

        const backVal = Process._getUserAccount_(req);

        if (backVal.userAccount) {
            message = await Process.article.checkArticle({
                userAccount: backVal.userAccount,
                articleId,
                stateNum
            });
        } else {
            message.code = backVal.code;
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 文章恢复
     * @param {*} req {articleId} = req.query
     * @param {*} res 
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async reductionArticle(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        let {
            articleId
        } = req.query;

        articleId = Number(articleId);
        const isVerify = Process.untils.verifyParams([{
            value: articleId,
            type: 'number'
        }]);

        if (!isVerify) {
            res.send({
                code: 300,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            });
            return;
        }

        const backVal = Process._getUserAccount_(req);

        if (backVal.userAccount) {
            message = await Process.article.reductionArticle({
                userAccount: backVal.userAccount,
                articleId
            });
        } else {
            message.code = backVal.code;
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 修改分类名称
     * @param {*} req {categoryId, categoryType} = req.query
     * @param {*} res 
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async updateCategory(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        let {
            categoryId,
            categoryType
        } = req.query;

        categoryId = Number(categoryId);
        const isVerify = Process.untils.verifyParams([{
                value: categoryId,
                type: 'number'
            },
            {
                value: categoryType,
                type: 'string'
            }
        ]);

        if (!isVerify) {
            res.send({
                code: 300,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            });
            return;
        }

        const backVal = Process._getUserAccount_(req);

        if (backVal.userAccount) {
            message = await Process.article.updateCategory({
                userAccount: backVal.userAccount,
                categoryId,
                categoryType
            });
        } else {
            message.code = backVal.code;
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 添加分类
     * @param {*} req {categoryType} = req.body
     * @param {*} res 
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async addCategory(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        let {
            categoryType
        } = req.body;

        const isVerify = Process.untils.verifyParams([{
            value: categoryType,
            type: 'string'
        }]);

        if (!isVerify) {
            res.send({
                code: 300,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            });
            return;
        }

        const backVal = Process._getUserAccount_(req);

        if (backVal.userAccount) {
            message = await Process.article.addCategory({
                userAccount: backVal.userAccount,
                categoryType
            });
        } else {
            message.code = backVal.code;
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 删除分类
     * @param {*} req {categoryId} = req.query
     * @param {*} res 
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async delCategory(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        let {
            categoryId
        } = req.query;

        categoryId = Number(categoryId);
        const isVerify = Process.untils.verifyParams([{
            value: categoryId,
            type: 'number'
        }]);

        if (!isVerify) {
            res.send({
                code: 300,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            });
            return;
        }

        const backVal = Process._getUserAccount_(req);

        if (backVal.userAccount) {
            message = await Process.article.delCategory({
                userAccount: backVal.userAccount,
                categoryId
            });
        } else {
            message.code = backVal.code;
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 获取所有文章评论
     * @param {*} req {currentPage, pageSize}
     * @param {*} res 
     * @returns {object} {code: 200, data: {comment: [{commentId, commentContent, commentTime, articleTitle, auditor, stateDes}], count}, message: '成功', success: true}
     */
    static async allComment(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        const backVal = Process._getUserAccount_(req);
        let {
            currentPage,
            pageSize
        } = req.query;

        if (backVal.userAccount) {
            message = await Process.article.queryAllComment({
                userAccount: backVal.userAccount,
                currentPage,
                pageSize
            });
        } else {
            message.code = backVal.code;
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 删除评论
     * @param {*} req {commentId} = req.query
     * @param {*} res 
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async delComment(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        let {
            commentId
        } = req.query;

        commentId = Number(commentId);
        const isVerify = Process.untils.verifyParams([{
            value: commentId,
            type: 'number'
        }]);

        if (!isVerify) {
            res.send({
                code: 300,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            });
            return;
        }

        const backVal = Process._getUserAccount_(req);

        if (backVal.userAccount) {
            message = await Process.article.delComment({
                userAccount: backVal.userAccount,
                commentId
            });
        } else {
            message.code = backVal.code;
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 评论审核
     * @param {*} req {commentId, stateId} = req.body
     * @param {*} res 
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async checkComment(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        let {
            commentId,
            stateId
        } = req.body;

        commentId = Number(commentId);
        const isVerify = Process.untils.verifyParams([{
                value: commentId,
                type: 'number'
            },
            {
                value: stateId,
                type: 'number'
            }
        ]);

        if (!isVerify) {
            res.send({
                code: 300,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            });
            return;
        }

        const backVal = Process._getUserAccount_(req);

        if (backVal.userAccount) {
            message = await Process.article.checkComment({
                userAccount: backVal.userAccount,
                commentId,
                stateId
            });
        } else {
            message.code = backVal.code;
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 获取留言列表
     * @param {*} req {currentPage, pageSize}
     * @param {*} res 
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async getMessageList(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        const backVal = Process._getUserAccount_(req);
        let {
            currentPage,
            pageSize
        } = req.query;

        if (backVal.userAccount) {
            message = await Process.article.getMessageList({
                userAccount: backVal.userAccount,
                currentPage,
                pageSize
            });
        } else {
            message.code = backVal.code;
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 删除留言
     * @param {*} req {msgId} = req.body
     * @param {*} res 
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async delMessage(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        let {
            msgId
        } = req.body;

        msgId = Number(msgId);
        const isVerify = Process.untils.verifyParams([{
            value: msgId,
            type: 'number'
        }]);

        if (!isVerify) {
            res.send({
                code: 300,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            });
            return;
        }

        const backVal = Process._getUserAccount_(req);

        if (backVal.userAccount) {
            message = await Process.article.delMessage({
                userAccount: backVal.userAccount,
                msgId
            });
        } else {
            message.code = backVal.code;
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 留言审核
     * @param {*} req {msgId, stateId} = req.body
     * @param {*} res 
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async checkMessage(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        let {
            msgId,
            stateId
        } = req.body;

        const isVerify = Process.untils.verifyParams([{
                value: msgId,
                type: 'number'
            },
            {
                value: stateId,
                type: 'number'
            }
        ]);

        if (!isVerify) {
            res.send({
                code: 300,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            });
            return;
        }

        const backVal = Process._getUserAccount_(req);

        if (backVal.userAccount) {
            message = await Process.article.checkMessage({
                userAccount: backVal.userAccount,
                msgId,
                stateId
            });
        } else {
            message.code = backVal.code;
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 获取用户信息
     * @param {*} req 
     * @param {*} res 
     * @returns {object} {code: 200, data: {userName, birthday, weChat, qqAcc, 
            email, hobby, personalDes, lifeMotto}, message: '成功', success: true}
     */
    static async blogUserInfo(req, res) {
        const message = await Process.users.blogUserInfo();

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 获取热门文章列表
     * @param {*} req 
     * @param {*} res 
     * @returns {object} {code: 200, data: {articleId, articleTitle, author, addTime, hot}, message: '成功', success: true}
     */
    static async blogHotArticles(req, res) {
        const message = await Process.article.blogHotArticles();

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 获取最新文章列表
     * @param {*} req { currentPage, pageSize, categoryType } = req.query
     * @param {*} res 
     * @returns {object} {code: 200, data: {articleId, articleTitle, author, addTime, hot}, message: '成功', success: true}
     */
    static async blogNewArticles(req, res) {
        let {
            currentPage,
            pageSize,
            categoryType
        } = req.body;

        if (isNaN(Number(currentPage))) {
            // 当前页码不为数字，则默认第一页
            currentPage = 1;
        } else {
            // 转为正整数
            currentPage = Math.abs(currentPage).toFixed();
        }

        if (isNaN(Number(pageSize))) {
            // 每页大小不为数字，则默认每页十二条
            pageSize = 12;
        } else {
            // 转为正整数
            pageSize = Math.abs(pageSize).toFixed();
        }

        const message = await Process.article.blogNewArticles({
            currentPage,
            pageSize,
            categoryType
        });

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 获取文章内容
     * @param {*} req {articleId} = req.query
     * @param {*} res 
     * @returns {object} {code: 200, data: {articleContent}, message: '成功', success: true}
     */
    static async blogArticleContent(req, res) {
        let {
            articleId
        } = req.query;

        if (isNaN(Number(articleId))) {
            res.send({
                code: 300,
                data: {},
                message: '文章id错误',
                success: false
            });
            return;
        }

        const message = await Process.article.blogArticleContent(Number(articleId));

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 获取文章评论列表
     * @param {*} req {articleId} = req.query
     * @param {*} res 
     * @returns {object} {code: 200, data: {commentList}, message: '成功', success: true}
     */
    static async blogCommentList(req, res) {
        let {
            articleId
        } = req.query;

        if (isNaN(Number(articleId))) {
            res.send({
                code: 300,
                data: {},
                message: '文章id错误',
                success: false
            });
            return;
        }

        const message = await Process.article.blogCommentList(Number(articleId));

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 搜索文章, 标题、作者、时间
     * @param {*} req { keyword } = req.query
     * @param {*} res 
     * @returns {object} {code: 200, data: {articles: [{articleId, articleTitle}]}, message: '成功', success: true}
     */
    static async blogSearchArticle(req, res) {
        let {
            keyword
        } = req.query;

        if (!keyword) {
            res.send({
                code: 300,
                data: {},
                message: '关键词错误',
                success: false
            });
            return;
        }

        const message = await Process.article.blogSearchArticle(keyword);

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 发表评论
     * @param {*} req { articleId,commentContent, parentId, replyId } = req.body
     * @param {*} res 
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async blogAddComment(req, res) {
        let {
            articleId,
            commentContent,
            parentId,
            replyId
        } = req.body;

        if (typeof articleId !== 'number') {
            res.send({
                code: 300,
                data: {},
                message: '参数错误',
                success: false
            });
            return;
        }

        if (typeof commentContent !== 'string' || commentContent.trim().length === 0) {
            res.send({
                code: 300,
                data: {},
                message: '参数错误',
                success: false
            });
            return;
        }

        // 父评论id不可以和回复的子评论id一样
        if (parentId !== undefined && replyId !== undefined && parentId === replyId) {
            res.send({
                code: 300,
                data: {},
                message: '参数错误',
                success: false
            });
            return;
        }

        if (parentId !== undefined && typeof parentId !== 'number') {
            res.send({
                code: 300,
                data: {},
                message: '参数错误',
                success: false
            });
            return;
        }

        if (replyId !== undefined && typeof replyId !== 'number') {
            res.send({
                code: 300,
                data: {},
                message: '参数错误',
                success: false
            });
            return;
        }

        const message = await Process.article.blogAddComment({
            articleId,
            commentContent,
            parentId,
            replyId
        });

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 留言
     * @param {*} req { msgContent } = req.body
     * @param {*} res 
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async blogAddMessage(req, res) {
        let {
            msgContent
        } = req.body;

        if (typeof msgContent !== 'string' || msgContent.trim().length === 0) {
            res.send({
                code: 300,
                data: {},
                message: '参数错误',
                success: false
            });
            return;
        }

        const message = await Process.article.blogAddMessage(msgContent);

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 获取留言列表
     * @param {*} req {currentPage, pageSize}
     * @param {*} res 
     * @returns {object} {code: 200, data: {messageList: [{msgContent, addTime}]}, message: '成功', success: true}
     */
    static async blogGetMessage(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        let {
            currentPage,
            pageSize
        } = req.query;

        message = await Process.article.queryMessage({
            currentPage,
            pageSize
        });

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 获取分类列表
     * @param {*} req
     * @param {*} res 
     * @returns {object} {code: 200, data: {categories: [{categoryType}]}, message: '成功', success: true}
     */
    static async blogGetCategory(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        message = await Process.article.queryCategory();

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
    }

    /**
     * @description 修改文章
     * @param {*} req {articleId, articleTitle, articleContent, categoryId} = req.body
     * @param {*} res 
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async updateArticle(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        let {
            articleId,
            articleTitle,
            articleContent,
            categoryId
        } = req.body;

        if (typeof articleId !== 'number' || (articleTitle == undefined && articleContent == undefined && categoryId == undefined)) {
            message.code = 300;
            message.message = '参数错误';
            res.send(message);
            return;
        }

        const backVal = Process._getUserAccount_(req);

        if (backVal.userAccount) {
            message = await Process.article.updateArticle({
                articleId,
                userAccount: backVal.userAccount,
                articleTitle,
                articleContent,
                categoryId
            });
        } else {
            message.code = backVal.code;
            message.message = backVal.message;
        }

        if (Process._verifyBackValue_(message)) {
            res.send(message);
        }
        else {
            res.send({
                code: 400,
                message: '服务器繁忙，请稍后再试',
                success: false
            });
        }
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
    delArticle: Process.delArticle,
    getUserList: Process.getUserList,
    delUser: Process.delUser,
    resetUser: Process.resetUser,
    getPowerList: Process.getPowerList,
    addUser: Process.addUser,
    updatePwd: Process.updatePwd,
    getAllArticle: Process.getAllArticle,
    checkArticle: Process.checkArticle,
    reductionArticle: Process.reductionArticle,
    updateCategory: Process.updateCategory,
    addCategory: Process.addCategory,
    delCategory: Process.delCategory,
    allComment: Process.allComment,
    delComment: Process.delComment,
    checkComment: Process.checkComment,
    getMessageList: Process.getMessageList,
    delMessage: Process.delMessage,
    checkMessage: Process.checkMessage,
    updateArticle: Process.updateArticle,
    blogUserInfo: Process.blogUserInfo,
    blogHotArticles: Process.blogHotArticles,
    blogNewArticles: Process.blogNewArticles,
    blogArticleContent: Process.blogArticleContent,
    blogCommentList: Process.blogCommentList,
    blogSearchArticle: Process.blogSearchArticle,
    blogAddComment: Process.blogAddComment,
    blogAddMessage: Process.blogAddMessage,
    blogGetMessage: Process.blogGetMessage,
    blogGetCategory: Process.blogGetCategory
};