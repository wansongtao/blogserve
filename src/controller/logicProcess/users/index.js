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
     * @param {object} {userAccount, userPassword}
     * @returns {boolean} 存在了返回true，反之返回false
     */
    static async _queryUser_({
        userAccount,
        userPassword
    }) {
        // 查询该账号是否存在
        const isHas = await Users._isUser_(userAccount);

        if (!isHas) {
            return false;
        }

        // 查询密码是否正确
        const sqlStr = 'SELECT userId from users where ISDELETE = ? and userAccount = ? and userPassword = ?';

        const data = await Users.database.query(sqlStr, [0, userAccount, userPassword]);

        if (data !== false && data.length > 0) {
            return true;
        }

        return false;
    }

    /**
     * @description 
     * @param {object} user 
     * @returns {object} {code: 200, data: {token}, message: '登录成功', success: true}
     */
    static async login({
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
        const sqlStr = 'SELECT userId from users where ISDELETE = ? and userAccount = ? and userPassword = ?';

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
        const roleId = await Users.getRoles(userAccount);
        let message = null;

        if (roleId === 10001) {
            const sqlStr = `select userName, userGender, userImgUrl, birthday, weChat, qqAcc, 
            email, hobby, personalDes, lifeMotto from userinfo where ISDELETE = ? and userAccount = ?`;

            const data = await Users.database.query(sqlStr, [0, userAccount]);

            if (data === false) {
                message = {
                    code: 401,
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

                let hobby = data[0].hobby;
                if (hobby.indexOf('/') !== -1) {
                    hobby = hobby.split('/')
                } else {
                    hobby = [hobby]
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
                        hobby,
                        personalDes: data[0].personalDes,
                        lifeMotto: data[0].lifeMotto,
                        roleId
                    },
                    message: '获取用户信息成功',
                    success: true
                };
            } else {
                message = {
                    code: 305,
                    data: {},
                    message: '未查询到任何相关信息',
                    success: false
                };
            }
        } else {
            const sqlStr = `select userName from userinfo where ISDELETE = ? and userAccount = ?`;

            const data = await Users.database.query(sqlStr, [0, userAccount]);

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
                        name: data[0].userName,
                        avatar: 'null',
                        roleId
                    },
                    message: '获取用户信息成功',
                    success: true
                };
            } else {
                message = {
                    code: 305,
                    data: {},
                    message: '未查询到任何相关信息',
                    success: false
                };
            }
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

    /**
     * @description 删除用户
     * @param {*} param0 {userAccount, adminAccount}
     * @returns {Promise} {code: 200, data: {}, message: '成功', success: true}
     */
    static async delUser({
        userAccount,
        adminAccount
    }) {
        const rolesId = await Users.getRoles(adminAccount);

        if (rolesId !== 10001) {
            return {
                code: 503,
                data: {},
                message: '权限不足',
                success: false
            };
        }

        const curDate = new Date();
        const myDate = curDate.toLocaleDateString();
        const myTime = curDate.toTimeString().substr(0, 8);
        const deltime = myDate + ' ' + myTime;
        const sqlStr = 'update users set ISDELETE = ?, DELETEACC = ?, DELETETIME = ? where userAccount = ?'

        const data = await Users.database.update(sqlStr, [1, adminAccount, deltime, userAccount]);

        let message = null;
        if (data) {
            message = {
                code: 200,
                data: {},
                message: '删除成功',
                success: true
            };
        } else {
            message = {
                code: 401,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 重置用户密码
     * @param {*} param0 {userAccount, adminAccount}
     * @returns {Promise} {code: 200, data: {}, message: '成功', success: true}
     */
    static async resetUserPwd({
        userAccount,
        adminAccount
    }) {
        const rolesId = await Users.getRoles(adminAccount);

        if (rolesId !== 10001) {
            return {
                code: 503,
                data: {},
                message: '权限不足',
                success: false
            };
        }

        const curDate = new Date();
        const myDate = curDate.toLocaleDateString();
        const myTime = curDate.toTimeString().substr(0, 8);
        const updateTime = myDate + ' ' + myTime;

        const pwd = 'w1' + userAccount + '123';

        const sqlStr = 'update users set userPassword = ?, UPDATEACC = ?, UPDATETIME = ? where ISDELETE = ? and userAccount = ?'

        const data = await Users.database.update(sqlStr, [pwd, adminAccount, updateTime, 0, userAccount]);

        let message = null;
        if (data) {
            message = {
                code: 200,
                data: {},
                message: '重置成功',
                success: true
            };
        } else {
            message = {
                code: 401,
                data: {},
                message: '服务器繁忙，请稍后再试',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 获取权限列表
     * @param {string} userAccount
     * @returns {Promise} {code: 200, data: {powerList: [{powerId, powerName}]}, message: '成功', success: true}
     */
    static async getPowerList(userAccount) {
        const rolesId = await Users.getRoles(userAccount);

        if (rolesId !== 10001) {
            return {
                code: 503,
                data: {},
                message: '权限不足',
                success: false
            };
        }

        const sqlStr = 'select powerId, powerName from power where ISDELETE = ?';

        const data = await Users.database.query(sqlStr, [0]);

        let message = null;
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
                    powerList: data
                },
                message: '获取成功',
                success: true
            };
        } else {
            message = {
                code: 305,
                data: {},
                message: '数据为空',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 添加用户
     * @param {object} data 
     * @returns {Promise} {code: 200, data: {}, message: '成功', success: true}
     */
    static async addUser(data) {
        const {
            userAccount,
            powerId,
            userName,
            userGender,
            adminAccount
        } = data;

        const rolesId = await Users.getRoles(adminAccount);

        if (rolesId !== 10001) {
            return {
                code: 503,
                data: {},
                message: '权限不足',
                success: false
            };
        }

        const userPassword = 'w1' + userAccount + '123';

        const curDate = new Date();
        const myDate = curDate.toLocaleDateString();
        const ADDTIME = myDate + ' ' + curDate.toTimeString().substr(0, 8);

        let message = null;
        const result = await Users.database.insertUser({
            userAccount,
            userPassword,
            ADDACC: adminAccount,
            ADDTIME,
            powerId,
            userName,
            userGender
        });

        if (result) {
            message = {
                code: 200,
                data: {},
                message: '添加用户成功',
                success: true
            };
        } else {
            message = {
                code: 401,
                data: {},
                message: '添加用户失败',
                success: false
            };
        }

        return message;
    }

    /**
     * @description 修改密码
     * @param {object} data {oldPassword, newPassword, userAccount}
     * @returns {Promise} {code: 200, data: {}, message: '成功', success: true}
     */
    static async updatePwd(data) {
        const {
            oldPassword,
            newPassword,
            userAccount
        } = data;

        // 判断原密码是否正确
        const isHas = await Users._queryUser_({userAccount, userPassword: oldPassword});

        if (!isHas) {
            return {
                code: 300,
                data: {},
                message: '原密码错误',
                success: false
            };
        }

        const curDate = new Date();
        const myDate = curDate.toLocaleDateString();
        const myTime = curDate.toTimeString().substr(0, 8);
        const updateTime = myDate + ' ' + myTime;

        const sqlStr = 'update users set userPassword = ?, UPDATEACC = ?, UPDATETIME = ?  where userAccount = ?';
        const result = await Users.database.update(sqlStr, [newPassword, userAccount, updateTime, userAccount]);

        let message = null;
        if (result) {
            message = {
                code: 200,
                data: {},
                message: '修改成功',
                success: true
            };
        }
        else {
            message = {
                code: 401,
                data: {},
                message: '修改失败',
                success: false
            };
        }

        return message;
    }
}

module.exports = {
    login: Users.login,
    queryUserInfo: Users.queryUserInfo,
    clearTokenUserInfo: Users.clearTokenUserInfo,
    updateUserInfo: Users.updateUserInfo,
    getUserList: Users.getUserList,
    delUser: Users.delUser,
    resetUserPwd: Users.resetUserPwd,
    getPowerList: Users.getPowerList,
    addUser: Users.addUser,
    updatePwd: Users.updatePwd
};