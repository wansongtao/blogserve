/**
 * @description 上传文件逻辑模块
 * @author wansongtao
 * @date 2020-12-17
 */
class UploadFile {
    static formidable = require('formidable')
    static path = require('path')

    /**
     * @description 将用户上传的照片存入磁盘
     * @param {*} req 
     * @returns {Promise} {success: true,statusCode: 200,data: {imgUrl: pathName},message: '上传成功'}
     */
    static uploadImage({req}) {
        return new Promise((resolve, reject) => {
            const form = new UploadFile.formidable()

            // 设置表单域的编码
            form.encoding = 'utf-8'

            // 设置上传文件存放的文件夹路径
            form.uploadDir = UploadFile.path.join(__dirname, '../../../upload')

            // 保留上传文件的后缀名
            form.keepExtensions = true

            // 设置字段的大小
            form.maxFieldsSize = 0.5 * 1024 * 1024

            // 设置上传文件的大小，500kb
            form.maxFileSize = 0.5 * 1024 * 1024

            form.onPart = (part) => {
                // 必须要调用form.parse(req, callback)方法 form.parse(req) => form.onPart() => form.parse()的回调callback
                // 只允许上传照片
                if (part.mime.indexOf('image') !== -1) {
                    // 调用这个方法才可以将文件存入磁盘
                    form.handlePart(part);
                } else {
                    reject({
                        success: false,
                        statusCode: 303,
                        data: {},
                        message: '只能上传照片'
                    });
                }
            };

            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.error('Class UploadFile => uploadImage() => form.parse(): ', err)
                    reject({
                        success: false,
                        statusCode: 304,
                        data: {},
                        message: '图片上传错误'
                    })
                } else {
                    // 如果用户上传的不是照片，files为空对象 => {}
                    if (files.file !== undefined) {
                        const pathName = '/upload/' + UploadFile.path.basename(files.file.path)

                        resolve({
                            success: true,
                            statusCode: 200,
                            data: {
                                imgUrl: pathName
                            },
                            message: '上传成功'
                        });
                    }
                }
            });
        })
    }
    
}

module.exports = {
    uploadImage: UploadFile.uploadImage
}
