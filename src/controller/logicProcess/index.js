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
     * @description 验证token，取出用户账号
     * @param {*} req 
     * @returns 验证成功返回用户账号, 获取token失败返回-2，token超时返回0，token错误返回-1
     */
    static _verifyToken_(req) {
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
            return -2;
        }

        // 因为前端传过来的token前面加上了‘Bearer’，具体格式为：'Bearer ' + token
        token = token.split(' ')[1];
        const backVal = this.token.verifyToken(token);

        return backVal;
    }

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
                message = {
                    code: 200,
                    userAccount: backVal
                };
            }
        } catch (ex) {
            console.error('class Process => _getUserAccount_(): ', ex.message);
        }
        finally {
            return message;
        }
    }

    /**
     * @description 根据验证token的返回值，执行相应的操作。
     * @param {function} fn 回调函数(异步)
     * @param {object} args 传给回调函数的参数对象
     * @returns {object} {code: 200, data: {}, message: '登录成功', success: true}
     */
    static async _backTokenProcess_(fn, args = {}) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        };

        /**
         * @description 验证token后的返回值
         */
        const {
            userAccount
        } = args;

        try {
            if (typeof userAccount === 'string') {
                message = await fn(args);
            } else if (userAccount === -2) {
                message = {
                    code: 300,
                    data: {},
                    message: '服务器繁忙，请稍后再试',
                    success: false
                };
            } else if (userAccount === 0) {
                message = {
                    code: 500,
                    data: {},
                    message: '用户身份过期，请重新登录',
                    success: false
                };
            } else if (userAccount === -1) {
                message = {
                    code: 501,
                    data: {},
                    message: '该账号已在别的地方登录',
                    success: false
                };
            }
        } catch (ex) {
            console.error('Class Process => _backTokenProcess_(): ', ex.message);
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
     * @returns {object} {code: 200, data: {用户信息}, message: '登录成功', success: true}
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
     * @returns {object} {code: 200, data: {}, message: '登录成功', success: true}
     */
    static async uploadImg(req, res) {
        let message = {
            code: 400,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        }

        const backVal = Process._getUserAccount_(req);

        message = await Process._backTokenProcess_(Process.uploadFile.uploadImage, {
            userAccount,
            req
        })

        res.send(message)
    }

    /**
     * @description 修改用户信息
     * @param {*} req 
     * @param {*} res 
     */
    static async editUserInfo(req, res) {
        let message = {
            code: 444,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        }

        let userAccount = Process._verifyToken_(req),
            userInfo = req.body;

        message = await Process._backTokenProcess_(Process.users.updateUserInfo, {
            userAccount,
            userInfo
        })

        res.send(message)
    }

    /**
     * @description 获取文章分类
     * @param {*} req 
     * @param {*} res 
     */
    static async getCategory(req, res) {
        let message = {
            code: 444,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        }

        let userAccount = Process._verifyToken_(req)

        message = await Process._backTokenProcess_(Process.article.getArticleCategory, {
            userAccount
        })

        res.send(message)
    }

    /**
     * @description 添加文章
     * @param {*} req 
     * @param {*} res 
     */
    static async addArticle(req, res) {
        let message = {
            code: 444,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        }

        let userAccount = Process._verifyToken_(req)

        message = await Process._backTokenProcess_(Process.article.addArticle, {
            userAccount,
            params: req.body
        })

        res.send(message)
    }

    /**
     * @description 获取文章列表
     * @param {*} req {currentPage, pageSize}
     * @param {*} res 
     */
    static async getArticleList(req, res) {
        let message = {
            code: 444,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        }

        let userAccount = Process._verifyToken_(req)

        message = await Process._backTokenProcess_(Process.article.queryArticleList, {
            userAccount,
            params: req.query
        })

        res.send(message)
    }

    /**
     * @description 获取文章内容
     * @param {*} req {id: 文章id}
     * @param {*} res 
     */
    static async queryArticleContent(req, res) {
        let message = {
            code: 444,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        }

        let userAccount = Process._verifyToken_(req)

        message = await Process._backTokenProcess_(Process.article.queryArticleContent, {
            userAccount,
            id: req.query.id
        })

        res.send(message)
    }

    /**
     * @description 删除文章
     * @param {*} req {id: 文章id}
     * @param {*} res 
     */
    static async delArticle(req, res) {
        let message = {
            code: 444,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        }

        let userAccount = Process._verifyToken_(req)

        message = await Process._backTokenProcess_(Process.article.delArticle, {
            userAccount,
            id: req.query.id
        })

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
}