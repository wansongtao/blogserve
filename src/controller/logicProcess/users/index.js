/**
 * @description 用户逻辑模块
 * @author wansongtao
 * @date 2020-12-08
 */
class Users {
    static database = require('../../database/database')
    static token = require('../../token')

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
            console.error('Class Users => _verifyParam_(): ', ex.message)
            return false
        }
    }

    /**
     * @description 查询该账号是否存在
     * @param {string} userAccount 账号
     * @returns {boolean} 存在了返回true，反之返回false
     */
    static async _isUser_(userAccount) {
        let isHas = false
        let sqlStr = 'SELECT userId from users where ISDELETE = ? and userAccount = ?'

        let data = await Users.database.query(sqlStr, [0, userAccount])

        if (data[0]) {
            isHas = true
        }

        return isHas
    }

    /**
     * @description 查询用户账号密码
     * @param {*} req.body {userAccount, userPassword}
     * @returns {object} {code: 200, data: {token}, message: '登录成功', success: true}
     */
    static async queryUser({
        userAccount,
        userPassword
    }) {

        let isVerify = Users._verifyParam_([{
            value: userAccount,
            type: 'string'
        }, {
            value: userPassword,
            type: 'string'
        }])

        if (!isVerify) {
            return {
                code: 300,
                data: {},
                message: '参数类型错误',
                success: false
            }
        }

        let isHas = await Users._isUser_(userAccount)
        if (!isHas) {
            return {
                code: 301,
                data: {},
                message: '账号不存在',
                success: false
            }
        }

        let sqlStr = 'SELECT userId from users where ISDELETE = ? and userAccount = ? and userPassword = ?'

        let data = await Users.database.query(sqlStr, [0, userAccount, userPassword]),
            message = {}

        if (data[0]) {
            let token = Users.token.createToken(userAccount)

            if (token === false) {
                return {
                    code: 402,
                    data: {},
                    message: '服务器错误',
                    success: false
                }
            }

            message = {
                code: 200,
                data: {
                    token
                },
                message: '登录成功',
                success: true
            }
        } else if (data[0] == null) {
            message = {
                code: 302,
                data: {},
                message: '密码错误',
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
     * @description 查询用户信息
     * @param {string} userAccount 
     * @returns {object} {code: 200, data: {name,avatar}, message: '成功', success: true}
     */
    static async queryUserInfo({
        userAccount
    }) {
        let sqlStr = `select userName, userGender, userImgUrl, birthday, weChat, qqAcc, 
        email, hobby, personalDes, lifeMotto from userinfo where ISDELETE = ? and userAccount = ?`

        let data = await Users.database.query(sqlStr, [0, userAccount]),
            message = {}

        if (data[0]) {
            message = {
                code: 200,
                data: {
                    name: data[0].userName,
                    userGender: data[0].userGender,
                    avatar: data[0].userImgUrl,
                    birthday: data[0].birthday,
                    weChat: data[0].weChat,
                    qqAcc: data[0].qqAcc,
                    email: data[0].email,
                    hobby: data[0].hobby.split('/'),
                    personalDes: data[0].personalDes,
                    lifeMotto: data[0].lifeMotto
                },
                message: '获取用户信息成功',
                success: true
            }
        } else {
            message = {
                code: 400,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            }
        }

        return message
    }

    /**
     * @description 删除保存的用户登录信息
     * @param {string} userAccount 用户账号
     * @returns {object} {code: 200, data: {name,avatar}, message: '成功', success: true}
     */
    static async clearTokenUserInfo({
        userAccount
    }) {
        let message = {}
        if (Users.token.deleteUserInfo(userAccount)) {
            message = {
                code: 200,
                data: {},
                message: '退出登录成功',
                success: true
            }
        } else {
            message = {
                code: 201,
                data: {},
                message: '删除用户的登录信息失败',
                success: true
            }
        }

        return message
    }

    /**
     * @description 修改用户信息
     * @param {object} {userAccount, userinfo} 
     * @returns {object} {code: 200, data: {}, message: '成功', success: true}
     */
    static async updateUserInfo({
        userAccount,
        userInfo
    }) {
        let isVerify = Users._verifyParam_([{
            value: userAccount,
            type: 'string'
        }, {
            value: userInfo,
            type: 'Object'
        }])

        if (!isVerify) {
            return {
                code: 300,
                data: {},
                message: '参数类型错误',
                success: false
            }
        }

        let sqlStr = `update userinfo set userName = ?, userGender = ?, userImgUrl = ?, birthday = ?, weChat = ?,
         qqAcc = ?, email = ?, hobby = ?, personalDes = ?, lifeMotto = ? where ISDELETE = ? and userAccount = ?`;
        let {
            userName,
            userGender,
            avatar,
            birthday,
            weChat,
            qqAcc,
            email,
            hobby,
            personalDes,
            lifeMotto
        } = userInfo,
        isSuccess = await Users.database.update(sqlStr, [userName, userGender, avatar, birthday.substr(0, 10), 
            weChat, qqAcc, email, hobby.join('/'), personalDes, lifeMotto, 0, userAccount]),
            message = {}
            
        if (isSuccess) {
            message = {
                code: 200,
                data: {},
                message: '修改用户信息成功',
                success: true
            }
        } else {
            message = {
                code: 400,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            }
        }

        return message
    }
}

module.exports = Users