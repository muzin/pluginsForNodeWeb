/**
 * 支付宝支付
 * @constructor
 */
function Alipay(){

  var ALIPAY_PRIVATE_KEY = null;
  var ALIPAY_PUBLIC_KEY = null;
  var inited = false;


  this.init = function init(configs){

  },

  /**
   * 给订单签名
   * @param params
   */
  this.signOrder = function signOrder(params){
    var code = generatorRandomNumber(6); // 生成6位随机码
    //订单号暂时由时间戳与6位随机码生成
    params.out_trade_no = Date.now().toString() + code;
    var myParam = getParams(AlipayConfig);
    var mySign = getSign(AlipayConfig);
    var last = myParam + '&sign="' + mySign + '"&sign_type="RSA2"';
    console.log(last)

  },

  /**
   * 验证订单的签名
   * @param params
   */
  this.verifySignOrder = function signOrder(params){

  }


  //签名
  function getSign(params) {
    try {
      //读取秘钥
      var privateKey = ALIPAY_PRIVATE_KEY;
      var prestr = getParams(params)
      var sign = crypto.createSign('RSA-SHA1');
      sign.update(prestr);
      sign = sign.sign(privateKey, 'base64');
      return encodeURIComponent(sign)
    } catch(err) {
      console.log('err', err)
    }
  }


  //将支付宝发来的数据生成有序数列
  function getVerifyParams(params) {
    var sPara = [];
    if(!params) return null;
    for(var key in params) {
      if((!params[key]) || key == "sign" || key == "sign_type") {
        continue;
      };
      sPara.push([key, params[key]]);
    }
    sPara = sPara.sort();
    var prestr = '';
    for(var i2 = 0; i2 < sPara.length; i2++) {
      var obj = sPara[i2];
      if(i2 == sPara.length - 1) {
        prestr = prestr + obj[0] + '=' + obj[1] + '';
      } else {
        prestr = prestr + obj[0] + '=' + obj[1] + '&';
      }
    }
    return prestr;
  }

  /**
   * 生成随机码
   * @param bit 随机码位数
   */
  function generatorRandomNumber(bit){
    var code = ""
    for(var i = 0; i < bit; i++) {
      code += Math.floor(Math.random() * 10);
    }
    return code;
  }

}

exports = module.exports = Alipay;
