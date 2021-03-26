/**
 * @description 用户逻辑模块
 * @author wansongtao
 * @date 2020-12-08
 */
class Users {
    static database = require('../../../database/database');
    static token = require('../../../token');

    /**
     * @description 查询该账号是否存在
     * @param {string} userAccount 账号
     * @returns {boolean} 存在了返回true，反之返回false
     */
    static async _isUser_(userAccount) {
        let isHas = false;

        const sqlStr = 'SELECT userId from users where ISDELETE = ? and userAccount = ?';

        const data = await Users.database.query(sqlStr, [0, userAccount]);

        if (data !== false && data.length > 0) {
            isHas = true;
        }

        return isHas;
    }

    /**
     * @description 获取用户角色
     * @param {string} userAccount 用户账号
     * @returns {number} 成功返回角色id，失败返回0
     */
    static async getRoles(userAccount) {
        let rolesId = 0;

        const queryStr = 'select powerId from userpower where userAccount = ?';
        const data = await Users.database.query(queryStr, [userAccount]);

        if (data !== false && data.length > 0) {
            rolesId = data[0].powerId;
        }

        return rolesId;
    }

    /**
     * @description 检查用户的账号和密码是否正确
     * @param {object} user {userAccount, userPassword}
     * @returns {object} {code: 200, data: {token}, message: '登录成功', success: true}
     */
    static async queryUser({
        userAccount,
        userPassword
    }) {
        // 查询该账号是否存在
        const isHas = await Users._isUser_(userAccount);

        if (!isHas) {
            return {
                code: 300,
                data: {},
                message: '账号不存在',
                success: false
            };
        }

        // 查询密码是否正确
        const sqlStr = 'SELECT userId from users where ISDELETE = ? and userAccount = ? and userPassword = ?'

        let data = await Users.database.query(sqlStr, [0, userAccount, userPassword]),
            message = {};

        if (data !== false && data.length > 0) {
            // 生成token
            const token = Users.token.createToken(userAccount);

            if (token === false) {
                return {
                    code: 402,
                    data: {},
                    message: 'token生成失败',
                    success: false
                };
            }

            message = {
                code: 200,
                data: {
                    token
                },
                message: '登录成功',
                success: true
            };
        } else if (data.length === 0) {
            message = {
                code: 300,
                data: {},
                message: '密码错误',
                success: false
            };
        } else {
            message = {
                code: 401,
                data: {},
                message: '服务器错误',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 查询用户信息
     * @param {string} userAccount 
     * @returns {object} {code: 200, data: {name,avatar,roles}, message: '成功', success: true}
     */
    static async queryUserInfo(userAccount) {
        const sqlStr = `select userName, userGender, userImgUrl, birthday, weChat, qqAcc, 
        email, hobby, personalDes, lifeMotto from userinfo where ISDELETE = ? and userAccount = ?`;

        let data = await Users.database.query(sqlStr, [0, userAccount]),
            message = {};

        if (data === false) {
            message = {
                code: 400,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            };
        } else if (data.length > 0) {
            // mysql的一个bug：数据库里存的为五月四号但查询出来的为五月三号（date类型）
            let birthday = null;
            if (data[0].birthday != undefined) {
                birthday = new Date(data[0].birthday);
                birthday = birthday.setDate(birthday.getDate() + 1);
                birthday = new Date(birthday).toISOString();
                birthday = birthday.substr(0, 10);
            }

            message = {
                code: 200,
                data: {
                    name: data[0].userName,
                    userGender: data[0].userGender,
                    avatar: data[0].userImgUrl,
                    birthday: birthday,
                    weChat: data[0].weChat,
                    qqAcc: data[0].qqAcc,
                    email: data[0].email,
                    hobby: data[0].hobby.split('/'),
                    personalDes: data[0].personalDes,
                    lifeMotto: data[0].lifeMotto
                },
                message: '获取用户信息成功',
                success: true
            };

            const roleStr = 'select powerId from userpower where userAccount = ?';
            const roleId = await Users.database.query(roleStr, [userAccount]);

            if (data && data.length > 0) {
                message.data.roleId = roleId[0].powerId;
            } else {
                message.code = 400;
                message.success = true;
                message.message = '用户角色获取失败';
            }
        } else if (data.length === 0) {
            message = {
                code: 305,
                data: {},
                message: '未查询到任何相关信息',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 删除用户登录信息
     * @param {string} userAccount 用户账号
     * @returns {object} {code: 200, data: {}, message: '退出登录成功', success: true}
     */
    static async clearTokenUserInfo(userAccount) {
        let message = {};

        if (Users.token.deleteUserInfo(userAccount)) {
            message = {
                code: 200,
                data: {},
                message: '退出登录成功',
                success: true
            };
        } else {
            message = {
                code: 502,
                data: {},
                message: '退出登录失败',
                success: false
            };
        }

        return message;
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
        let setStr = '',
            paramArr = [];

        // 获取要修改的信息，转化为一部分sql语句（如：userName = ?, userGender = ?），同时将值保存到数组中
        for (let [key, value] of Object.entries(userInfo)) {
            setStr += ` ${key} = ?,`; // 最后会多出一个逗号

            if (key === 'hobby') {
                value = value.join('/');
            }

            paramArr.push(value);
        }

        // 处理最后多出的逗号
        setStr = setStr.substring(0, setStr.length - 1);
        const sqlStr = `update userinfo set ${setStr} where ISDELETE = ? and userAccount = ?`;
        paramArr.push(0);
        paramArr.push(userAccount);

        const isSuccess = await Users.database.update(sqlStr, paramArr);

        let message = {};

        if (isSuccess) {
            message = {
                code: 200,
                data: {},
                message: '修改用户信息成功',
                success: true
            };
        } else {
            message = {
                code: 401,
                data: {},
                message: '修改用户信息失败',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 获取用户列表
     * @param {*} param0 {userAccount, currentPage, pageSize}
     * @returns {Promise} {code: 200, data: {userList: [{userAccount, powerName, userName, userGender}], count: 0}, message: '成功', success: true}
     */
    static async getUserList({
        userAccount,
        currentPage,
        pageSize
    }) {
        const rolesId = await Users.getRoles(userAccount);

        if (rolesId !== 10001) {
            return {
                code: 503,
                data: {},
                message: '权限不足',
                success: false
            };
        }

        let message = null;

        // mysql语句: limit 每页条数 offset 起始位置   第一页从0开始，所以减一
        const sqlStr = `select userAccount, powerName, userName, userGender from userlist where ISDELETE = ? 
         limit ${pageSize} offset ${(currentPage - 1) * pageSize}`;

        const data = await Users.database.query(sqlStr, [0]);

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
                    userList: data,
                    count: data.length
                },
                message: '获取成功',
                success: true
            };
        } else {
            message = {
                code: 400,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            };
        }

        return message;
    }
}

module.exports = {
    queryUser: Users.queryUser,
    queryUserInfo: Users.queryUserInfo,
    clearTokenUserInfo: Users.clearTokenUserInfo,
    updateUserInfo: Users.updateUserInfo,
    getUserList: Users.getUserList
};