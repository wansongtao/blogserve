/**
 * @description 工具类
 * @author 万松涛
 * @date 2021-03-18
 */
class Untils {

    /**
     * @description 验证参数的类型是否正确，可验证的参数类型['number', 'string', 'boolean', 'object', 'array', 'function']
     * @param {Array} param [{value: '值', type: 'String'}]
     * @returns {Boolean} true 正确
     */
    static verifyParams(param = []) {
        let backVal = false;
        // 可验证的数据类型
        const typeArr = ['number', 'string', 'boolean', 'object', 'array', 'function'];

        try {
            backVal = param.every((item) => {
                const type = item.type.toLowerCase();
                let tempVal = false;

                // 判断要验证的数据类型是否在范围内
                if (typeArr.indexOf(type) === -1) {
                    console.error('untils.js => verifyParams(): 未知的数据类型');
                    return tempVal;
                }

                // 复杂数据类型使用instanceof判断，简单数据类型使用typeof判断。因为数组和函数也是Object类型，所以将object放这两个后面判断。
                if (type === 'array') {
                    if (item.value instanceof Array) {
                        tempVal = true;
                    }
                }
                else if (type === 'function') {
                    if (item.value instanceof Function) {
                        tempVal = true;
                    }
                }
                else if (type === 'object') {
                    if (item.value instanceof Object) {
                        tempVal = true;
                    }
                }
                else {
                    if (typeof item.value === type) {
                        tempVal = true;
                    }
                }

                return tempVal;
            });
        } catch (ex) {
            console.error('untils.js => verifyParams(): ', ex.message);
        } finally {
            return backVal;
        }
    }

    /**
     * @description 验证参数格式。
     * @param {array} param [{value: '值', regExp: '正则表达式'}]
     * @returns {boolean} 格式正确返回true，错误返回false
     */
    static verifyFormat(param = []) {
        let backVal = false;

        try {
            backVal = param.every((item) => {
                return item.regExp.test(item.value);
            });
        }
        catch(ex) {
            console.error('untils.js => verifyFormat(): ', ex.message);
        }
        finally {
            return backVal;
        }
    }
}

module.exports = Untils;