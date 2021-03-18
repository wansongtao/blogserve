/**
 * @description token模块
 * @author wansongtao
 * @date 2020-12-11
 */
class Token {
    static jsonwebtoken = require('jsonwebtoken')

    /**
     * @description 存储用户登录信息
     */
    static userInfoArr = [];

    static key = 'wansongtao8946513488'

    /**
     * @description 将用户id和用户标识码保存起来
     * @param {number} userId 用户id
     * @param {string} userKey 用户登录时，生成的唯一标识码
     */
    static _userInfo_(userId, userKey) {
        let userInfoArr = Token.userInfoArr

        if (userInfoArr.length > 0) {
            let isSame = false

            userInfoArr.forEach(item => {
                // 如果该用户的信息已经存在了，则替换userKey的值
                if (item.userId === userId) {
                    item.userKey = userKey
                    isSame = true
                }
            })

            //如果不存在，则推入
            if (!isSame) {
                userInfoArr.push({
                    userId,
                    userKey
                })
            }
        } else {
            userInfoArr = [{
                userId,
                userKey
            }]
        }

        Token.userInfoArr = userInfoArr
    }

    /**
     * @description 验证用户的唯一标识码（实现单点登录）
     * @param {number} userId 
     * @param {string} userKey 
     * @returns 通过返回true，否则返回false
     */
    static _verifyUserKey_(userId, userKey) {
        return Token.userInfoArr.some(item => {
            if (item.userId == userId && item.userKey == userKey) {
                return true
            }

            return false
        })
    }

    /**
     * @description 创建token
     * @param {string} userId 用户账号 
     * @returns 返回token或false
     */
    static createToken(userId) {
        try {
            //生成一个用户标识码
            let num1 = Math.ceil(Math.random() * 10000 + 1000)
            let num2 = Math.floor(Math.random() * 1000 + 888)
            let userKey = 'wansongtao' + num1.toString() + num2.toString()

            const token = Token.jsonwebtoken.sign({
                userId,
                userKey
            }, Token.key, {
                expiresIn: '4h'
            })

            Token._userInfo_(userId, userKey)

            return token
        } catch (ex) {
            console.error('Class Token => createToken(): ', ex.message)
            return false
        }
    }

    /**
     * @description 验证token
     * @param {string} token 
     * @returns {number} 验证通过返回用户账号，超时返回0，token错误返回-1
     */
    static verifyToken(token) {
        try {
            const data = Token.jsonwebtoken.verify(token, Token.key)

            let userId = data.userId, userKey = data.userKey

            if (Token._verifyUserKey_(userId, userKey)) {
                return userId
            }
            return -1
        }
        catch(ex) {
            console.error('Class Token => verifyToken(): ', ex.message)
            return 0
        }
    }

    /**
     * @description 删除该用户的登录信息
     * @param {string} userAccount 用户账号
     * @returns {boolean} 成功true
     */
    static deleteUserInfo(userAccount) {
        let backVal = false

        if (typeof userAccount !== 'string') {
            console.error('Class Token => deleteUserInfo(): arguments type error.')
            backVal = false
        }
        else {
            Token.userInfoArr.forEach((item, index) => {
                if (item.userId === userAccount) {
                    Token.userInfoArr.splice(index, 1)
                    backVal = true
                }
            })
        }

        return backVal
    }
}

module.exports = {
    createToken: Token.createToken,
    verifyToken: Token.verifyToken,
    deleteUserInfo: Token.deleteUserInfo
}
