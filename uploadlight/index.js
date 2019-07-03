
var Multer  = require('multer')

/**
 * 轻量级文件上传组建
 * @constructor
 */
function UploadLight(){

    var multer = null;

    var config = null;

    /**
     * 初始化轻量级上传组建
     * @param config
     */
    this.init = function(c){
        if(c){
            config = c
        }else{
            config = { dest: '/tmp/' }
        }
        return this;
    }

    this.getMulter = function(){
        if(multer == null){
            multer = Multer(config)
        }
        return multer;
    }

    /**
     * 单个文件
     * @param name
     * @returns {*}
     */
    this.single = function single(name){
        return this.getMulter().single(name)
    }

    /**
     * 文件数组
     * @param name
     * @returns {*}
     */
    this.array = function array(name, maxCount){
        return this.getMulter().array(name, maxCount)
    }

    /**
     * 多个文件
     * @param fields
     * @returns {*}
     */
    this.fields = function fields(fields){
        return this.getMulter().fields(fields)
    }

    this.none = function none(){
        return this.getMulter.none()
    }

    this.any = function any(){
        return this.getMulter().any()
    }


}

exports = module.exports = new UploadLight();
