/**
 * Created by muzin on 17-9-11.
 */

var AliApi = require('./ali-sdk-nodejs');
var AliApiClient = AliApi.ApiClient;

const REST_URL = 'http://gw.api.taobao.com/router/rest';
const smsSendUid = 'alibaba.aliqin.fc.sms.num.send';

var AliSMS = function(){

    // sms 客户端对象
    var client = null;
    // app key
    var appkey = '';
    // app secret
    var appsecret = '';
    // 是否初始化过
    var inited = false;

    /**
     * 初始化sms数据访问对象
     * info {
     *     appkey,
     *     appsecret
     * }
     */
    this.init = function(info){
        if(inited)
            return;
        if(info && info.appkey && info.appsecret) {
            appkey = info.appkey;
            appsecret = info.appsecret;
            inited = true;
        }
    };

    /**
     * 获取sms请求客户端
     * @returns {*}
     */
    this.getClient = function(){
        var selfname = this.__proto__.constructor.name;
        if(!inited)
            throw `${ selfname } does not initialied.`;
        if(client == null){
            client = new AliApiClient({
                appkey : appkey,
                appsecret : appsecret,
                REST_URL : REST_URL
            });
        }
        return client;
    }


    /**
     * 发送短信
     * @param obj
     *       sms_free_sign_name = '';      短信签名
             sms_param = {};               短信参数
             rec_num = '';                 短信发送到指定手机号，群发用逗号隔开
             sms_template_code = '';       短信模板编码
     */
    this.sendSms = function(param, callback){
        if(typeof callback !== 'function') callback = function(){};
        var p = {};
        p.rec_num = param.phone;
        p.sms_param = JSON.stringify(param.param);
        p.extend = param.extend || '';
        p.sms_type = 'normal';
        p.sms_free_sign_name = param.sms_free_sign_name;
        p.sms_template_code = param.sms_template_code;
        console.log(p);
        let client = this.getClient();
        client.execute(smsSendUid, p, function(error, response){
            callback(error, response);
        });
    }
}


/**
 * 发送短信的错误码
 */
const SmsErrCode = {

    'isv.OUT_OF_SERVICE' : {
        desc : '业务停机',
        solution : '登陆www.alidayu.com充值'
    },

    'isv.PRODUCT_UNSUBSCRIBE' : {
        desc : '产品服务未开通',
        solution : '登陆www.alidayu.com开通相应的产品服务'
    },

    'isv.ACCOUNT_NOT_EXISTS' : {
        desc : '账户信息不存在',
        solution : '登陆www.alidayu.com完成入驻'
    },

    'isv.ACCOUNT_ABNORMAL' : {
        desc : '账户信息异常',
        solution : '联系技术支持'
    },

    'isv.SMS_TEMPLATE_ILLEGAL' : {
        desc : '模板不合法',
        solution : '登陆www.alidayu.com查询审核通过短信模板使用'
    },

    'isv.SMS_SIGNATURE_ILLEGAL' : {
        desc : '签名不合法',
        solution : '登陆www.alidayu.com查询审核通过的签名使用'
    },

    'isv.MOBILE_NUMBER_ILLEGAL' : {
        desc : '手机号码格式错误',
        solution : '使用合法的手机号码'
    },

    'isv.MOBILE_COUNT_OVER_LIMIT' : {
        desc : '手机号码数量超过限制',
        solution : '批量发送，手机号码以英文逗号分隔，不超过200个号码'
    },

    'isv.TEMPLATE_MISSING_PARAMETERS' : {
        desc : '短信模板变量缺少参数',
        solution : '确认短信模板中变量个数，变量名，检查传参是否遗漏'
    },

    'isv.INVALID_PARAMETERS' : {
        desc : '参数异常',
        solution : '检查参数是否合法'
    },

    'isv.BUSINESS_LIMIT_CONTROL' : {
        desc : '触发业务流控限制',
        solution : '短信验证码，使用同一个签名，对同一个手机号码发送短信验证码，支持1条/分钟，5条/小时，10条/天。一个手机号码通过阿里大于平台只能收到40条/天。 短信通知，使用同一签名、同一模板，对同一手机号发送短信通知，允许每天50条（自然日）。'
    },

    'isv.INVALID_JSON_PARAM' : {
        desc : 'JSON参数不合法',
        solution : 'JSON参数接受字符串值。例如{"code":"123456"}，不接收{"code":123456}'
    },

    'isp.SYSTEM_ERROR' : {
        desc : ' - ',
        solution : ' - '
    },

    'isv.BLACK_KEY_CONTROL_LIMIT' : {
        desc : '模板变量中存在黑名单关键字。如：阿里大鱼',
        solution : '黑名单关键字禁止在模板变量中使用，若业务确实需要使用，建议将关键字放到模板中，进行审核。'
    },

    'isv.PARAM_NOT_SUPPORT_URL' : {
        desc : '不支持url为变量',
        solution : '域名和ip请固化到模板申请中'
    },

    'isv.PARAM_LENGTH_LIMIT' : {
        desc : '变量长度受限',
        solution : '变量长度受限 请尽量固化变量中固定部分'
    },

    'isv.AMOUNT_NOT_ENOUGH' : {
        desc : '余额不足',
        solution : '因余额不足未能发送成功，请登录管理中心充值后重新发送'
    }


};


AliSMS.prototype.SmsErrCode = SmsErrCode;

exports = module.exports = AliSMS;
