/**
 * @description 逻辑模块
 * @author wansongtao
 * @date 2020-12-08
 */
class Process {
    static users = require('./users')
    static token = require('../token')

    /**
     * @description 验证token
     * @param {*} req 
     * @returns 通过返回用户账号, 获取token失败返回-2，token超时返回0，token错误返回-1
     */
    static verifyToken(req) {
        let token = ''

        if (req.query.token != undefined) {
            token = req.query.token
        } else if (req.headers.authorization != undefined) {
            token = req.headers.authorization
        } else if (req.cookies.authorization != undefined) {
            token = req.cookies.authorization
        } else {
            return -2
        }
        
        token = token.split(' ')[1]
        let userId = this.token.verifyToken(token)

        return userId
    }

    /**
     * @description 用户登录
     * @param {*} req 
     * @param {*} res 
     */
    static async login(req, res) {
        let message = {
            code: 500,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        }

        message = await Process.users.queryUser(req.body)

        res.send(message)
    }

    /**
     * @description 获取用户信息
     * @param {*} req 
     * @param {*} res 
     */
    static async getUserInfo(req, res) {
        let message = {
            code: 500,
            data: {},
            message: '服务器繁忙，请稍后再试',
            success: false
        }

        let userAccount = Process.verifyToken(req)

        if (typeof userAccount === 'string') {
            message = await Process.users.queryUserInfo(userAccount)
        } else if (userAccount === -2) {
            message = {
                code: 300,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            }
        } else if (userAccount === 0) {
            message = {
                code: 500,
                data: {},
                message: '用户身份过期，请重新登录',
                success: false
            }
        } else if (userAccount === -1) {
            message = {
                code: 501,
                data: {},
                message: '该账号已在别的地方登录',
                success: false
            }
        }

        res.send(message)
    }
}

module.exports = Process