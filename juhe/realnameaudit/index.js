
var request = require('request');

var JUHE_KEY = "94d2b462a823b0924371e7402c616a86";
var REALNAME_AUDIT_URL = "https://op.juhe.cn/idcard/query";

/**
 * 实名认证
 * @type {{}}
 */
exports = module.exports = {

    /**
     * 查询
     * @param name      真实姓名
     * @param idcard    身份证号
     * @returns {Promise<any>}
     */
    query: function audit(name, idcard){
        return new Promise((resolve, reject)=>{

            var options = {
                method: 'GET',
                url: REALNAME_AUDIT_URL,
                qs: {
                    key: JUHE_KEY,
                    idcard,
                    realname: name
                },
                headers: {},
                json: true
            }

            request(options, (error, response, body)=> {
                if (error) throw new Error(error);

                // match, 返回空 说明接口调用有问题
                // res == 1 时，身份证号和姓名匹配
                if(body.result){
                    if(body.result.res == 1){
                        body['match'] = true
                    }else{
                        body['match'] = false
                    }
                } else{
                    body['match'] = false
                }

                resolve(body)
            });

        });
    }


}
