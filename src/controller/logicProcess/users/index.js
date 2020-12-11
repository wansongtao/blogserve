/**
 * @description 用户逻辑模块
 * @author wansongtao
 * @date 2020-12-08
 */
class Users {
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
     * @returns {object} {code: 200, data: {}, message: '登录成功', success: true}
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
            return {code: 300, data: {}, message: '参数类型错误', success: false}
        }

        let isHas = await Users._isUser_(userAccount)
        if (!isHas) {
            return {code: 301, data: {}, message: '账号不存在', success: false}
        }

        let sqlStr = 'SELECT userId from users where ISDELETE = ? and userAccount = ? and userPassword = ?'

        let data = await Users.database.query(sqlStr, [0, userAccount, userPassword]),
        message = {}

        if (data[0]) {
            message = {code: 200, data: {}, message: '登录成功', success: true}
        }
        else if (data[0] == null) {
            message = {code: 302, data: {}, message: '密码错误', success: false}
        }
        else {
            message = {code: 401, data: {}, message: '服务器错误', success: false}
        }

        return message
    }
}

module.exports = Users