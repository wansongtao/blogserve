/**
 * @description token模块
 * @author 万松涛
 * @date 2020-12-11
 */
class Token {
    static jsonwebtoken = require('jsonwebtoken')

    /**
     * @description 存储用户登录信息
     */
    static userInfoArr = [];

    /**
     * @description 用来生成token的key值
     */
    static key = 'wansongtao8946513488'

    /**
     * @description 将用户账号和用户标识码保存起来
     * @param {number} userAccount 用户账号
     * @param {string} userKey 用户登录时，生成的唯一标识码
     */
    static _userInfo_(userAccount, userKey) {
        let userInfoArr = Token.userInfoArr;

        if (userInfoArr.length > 0) {
            let isSame = false;

            userInfoArr.forEach(item => {
                // 如果该用户的信息已经存在了，则替换userKey的值
                if (item.userAccount === userAccount) {
                    item.userKey = userKey;
                    isSame = true;
                }
            });

            //如果不存在，则推入
            if (!isSame) {
                userInfoArr.push({
                    userAccount,
                    userKey
                });
            }
        } else {
            userInfoArr = [{
                userAccount,
                userKey
            }];
        }

        Token.userInfoArr = userInfoArr;
    }

    /**
     * @description 验证用户的唯一标识码（实现单点登录）
     * @param {string} userAccount 用户账号
     * @param {string} userKey 
     * @returns 通过返回true，否则返回false
     */
    static _verifyUserKey_(userAccount, userKey) {
        return Token.userInfoArr.some(item => {
            if (item.userAccount === userAccount && item.userKey === userKey) {
                return true;
            }

            return false;
        });
    }

    /**
     * @description 创建token
     * @param {string} userAccount 用户账号 
     * @returns 返回token或false
     */
    static createToken(userAccount) {
        try {
            //生成一个用户标识码
            const num1 = Math.ceil(Math.random() * 10000 + 1000);
            const num2 = Math.floor(Math.random() * 1000 + 888);
            const userKey = 'wansongtao' + num1.toString() + num2.toString();

            // 生成token，将用户账号和唯一标识码存入其中，设置过期时间2h
            const token = Token.jsonwebtoken.sign({
                userAccount,
                userKey
            }, Token.key, {
                expiresIn: '2h'
            });

            // 保存用户登录信息
            Token._userInfo_(userAccount, userKey);

            return token;
        } catch (ex) {
            console.error('Class Token => createToken(): ', ex.message);
            return false;
        }
    }

    /**
     * @description 验证token
     * @param {string} token token字符串
     * @returns 验证通过返回用户账号，超时返回0，用户在其他地方登录了返回-1，token错误返回-2
     */
    static verifyToken(token) {
        let backVal = -2;

        try {
            // 验证token，并从中取出保存的信息(用户账户，用户唯一标识码)
            const data = Token.jsonwebtoken.verify(token, Token.key);
            const {userAccount, userKey} = data;

            // 验证用户唯一标识码
            if (Token._verifyUserKey_(userAccount, userKey)) {
                backVal = userAccount;
            }
            else {
                backVal = -1;
            }
        }
        catch(ex) {
            console.error('Class Token => verifyToken(): ', ex.message);

            // jwt expired：超时错误
            if (ex.message === 'jwt expired') {
                backVal = 0;
            } else {
                // token错误
                backVal = -2;
            }
        }
        finally {
            return backVal;
        }
    }

    /**
     * @description 删除该用户的登录信息
     * @param {string} userAccount 用户账号
     * @returns {boolean} 成功true
     */
    static deleteUserInfo(userAccount) {
        let backVal = false;

        if (typeof userAccount !== 'string') {
            console.error('Class Token => deleteUserInfo(): arguments type error.');
            backVal = false;
        }
        else {
            Token.userInfoArr.forEach((item, index) => {
                if (item.userAccount === userAccount) {
                    Token.userInfoArr.splice(index, 1);
                    backVal = true;
                }
            });
        }

        return backVal;
    }
}

module.exports = {
    createToken: Token.createToken,
    verifyToken: Token.verifyToken,
    deleteUserInfo: Token.deleteUserInfo
};
