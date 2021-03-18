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
        const typeArr = ['number', 'string', 'boolean', 'object', 'array', 'function'];

        try {
            backVal = param.every((item) => {
                const type = item.type.toLowerCase();
                let tempVal = false;

                if (typeArr.indexOf(type) === -1) {
                    console.error('untils.js => verifyParams(): 未知的数据类型');
                    return tempVal;
                }

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
}

module.exports = Untils;