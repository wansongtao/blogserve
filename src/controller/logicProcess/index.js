/**
 * @description 逻辑模块
 * @author wansongtao
 * @date 2020-12-08
 */
class Process {
    static users = require('./users')

    static async login(req, res) {
        let message = {code: 500, data: {}, message: '服务器繁忙，请稍后再试', success: false}

        message = await Process.users.queryUser(req.body)

        res.send(message)
    }
}

module.exports = Process