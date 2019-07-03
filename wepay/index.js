
var request = require("request");
var fs = require('fs');
var crypto = require('crypto');
var xmlParseString = require('xml2js').parseString;


function Wepay () {
  
  var appid = null;
  var appsecret = null;
  var mchid = null;
  var mchsecret = null;
  var notify_url = null;
  
  // app 的  appid appsecret
  var app_appid = null;
  var app_appsecret = null;
  
  /**
   * 初始化 微信支付
   * @param opts
   */
  this.init = function(opts){
    appid = opts.appid;
    appsecret = opts.appsecret;
    mchid = opts.mchid;
    mchsecret = opts.mchsecret;
    notify_url = opts.notify_url;
    app_appid = opts.app_appid;
    app_appsecret = opts.app_appsecret;
  }
  
  // 保存 web 授权 token 信息
  function saveWebAuthTokenInfo(token_info){
    return new Promise((resolve, reject)=>{
    
    })
  }
  
  
  /**
   * 获取请求签名
   * @param params 参数
   * @param apikey key
   */
  function getReqSign(params, apikey){
    var ret = raw1(params)
    ret += `&key=${apikey}`
    var md5 = crypto.createHash('md5');
    var result = md5.update(ret, 'utf8').digest('hex').toUpperCase();
    return result
  }
  
  function raw1(args) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs = {};
    keys.forEach(function (key) {
      newArgs[key] = args[key];
    });
    var string = '';
    for (var k in newArgs) {
      string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
  };


  //
  function paysignjs(appid,nonceStr,package,signType,timeStamp) {
    
    var ret = {
      appId: appid,
      nonceStr: nonceStr,
      package:package,
      signType:signType,
      timeStamp:timeStamp
    };
    var string = raw1(ret);
    
    // 商户 api 秘钥
    var key = mchsecret;
    
    string = string + '&key='+key;
    console.log(string);
    var crypto = require('crypto');
    return crypto.createHash('md5').update(string,'utf8').digest('hex');
  };


  // 随机字符串
  function randomStr(bit=16){
    var baseStr = 'abcdefghigklmnopqrstuvwxyz0123456789'
    var str = '';
    for(var i = 0; i < bit; i++){
      var min = 0;
      var max = baseStr.length
      var t = (Math.floor(Math.random() * (max - min))) + min
      str += baseStr[t]
    }
    return str;
  }

  // 随机数字
  function randomNum(bit=8){
    var baseStr = '0123456789'
    var str = '';
    for(var i = 0; i < bit; i++){
      var min = 0;
      var max = baseStr.length
      var t = (Math.floor(Math.random() * (max - min))) + min
      str += baseStr[t]
    }
    return str;
  }
  
  
  /**
   * 统一  下单
   * @param opts {
   *    attach: 附加数据，
   *    body: body，
   *    openid： openid
   *    out_trade_no:
   *    total_fee: （元） 程序内自动转成分
   *    spbill_create_ip: 下单 ip
   * }
   * @returns {Promise<any>}
   */
  function placeOrder(opts){
    
    var total_fee = opts.total_fee
    var total_fee_fixed = total_fee.toFixed(2);
    var total_fee_float = parseFloat(total_fee_fixed) * 100;
    opts['total_fee'] = total_fee_float;
    
    // 随机字符串
    var nonce_str = randomStr(32);
    // 生成 商户订单号
    var out_trade_no = generOutTradeNo();
    
    var timeStamp = Math.floor(new Date().getTime() / 1000);
    var sign_type = 'MD5';
    
    return new Promise((resolve, reject)=>{
      try {
        // 基本 下单参数
        var baseOrder = {
          appid: appid,
          mch_id: mchid,
          trade_type: 'JSAPI',
          notify_url: notify_url,
          sign_type: sign_type
        }
  
        opts['nonce_str'] = nonce_str;
        opts['out_trade_no'] = out_trade_no;
  
        var placeOrder = Object.assign({}, baseOrder, opts);
  
        // 签名
        placeOrder['sign'] = getReqSign(placeOrder, mchsecret);
  
        // 将参数 生成 为 xml
        var xmlBody = simpleObjectToXml(placeOrder)
  
        var options = {
          url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
          method: 'POST',
          body: xmlBody
        };
  
        request(options, (error, response, body) => {
          if (error) throw new Error(error);
          console.log(body);
          if (!error && response.statusCode == 200) {
            xmlParseString(body, (err, result) => {
              console.log(result)
              var prepay_id = getXMLNodeValue('prepay_id', body.toString("utf-8"));
              var tmp = prepay_id.split('[');
              var tmp1 = tmp[2].split(']');
              //签名
              var _paySignjs = paysignjs(appid, nonce_str, 'prepay_id=' + tmp1[0], 'MD5', timeStamp);
        
              resolve({
                out_trade_no,
                nonce_str,
                body: placeOrder['body'],
                attach: placeOrder['attach'],
                trade_type: placeOrder['trade_type'],
                total_fee: total_fee,
                sign: placeOrder['sign'],
                appid: placeOrder['appid'],
                mch_id: placeOrder['mch_id'],
                jsapi_package: {
                  appId: appid,
                  timeStamp: timeStamp + '',
                  nonce_str: nonce_str,
                  signType: sign_type,
                  prepay_id: tmp1[0],
                  _paySignjs: _paySignjs
                }
              });
        
            })
          } else {
            throw new LogicException().setShow(true).setMsg('下单失败').setCode('place_order_faild');
          }
    
        });
      }catch(e){
        throw new LogicException().setShow(true).setMsg('下单失败').setCode('place_order_faild');
      }
      
    });
  }
  
  /**
   * 统一 下单 为了 app
   * @param opts {
   *    attach: 附加数据，
   *    body: body，
   *    openid： openid
   *    out_trade_no:
   *    total_fee: （元） 程序内自动转成分
   *    spbill_create_ip: 下单 ip
   * }
   * @returns {Promise<any>}
   */
  function placeOrderForApp(opts){
    
    var total_fee = opts.total_fee
    var total_fee_fixed = total_fee.toFixed(2);
    var total_fee_float = parseFloat(total_fee_fixed) * 100;
    opts['total_fee'] = total_fee_float;
    
    // 将appid  设置为 开放平台的appid
    var appid = app_appid;
    
    // 随机字符串
    var nonce_str = randomStr(32);
    // 生成 商户订单号
    var out_trade_no = generOutTradeNo();
    
    var timeStamp = Math.floor(new Date().getTime() / 1000);
    var sign_type = 'MD5';
    
    return new Promise((resolve, reject)=>{
      try {
        // 基本 下单参数
        var baseOrder = {
          appid: appid,
          mch_id: mchid,
          trade_type: 'APP',
          notify_url: notify_url,
          sign_type: sign_type
        }
        
        opts['nonce_str'] = nonce_str;
        opts['out_trade_no'] = out_trade_no;
        
        var placeOrder = Object.assign({}, baseOrder, opts);
        
        // 签名
        placeOrder['sign'] = getReqSign(placeOrder, mchsecret);
        
        // 将参数 生成 为 xml
        var xmlBody = simpleObjectToXml(placeOrder)
        
        var options = {
          url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
          method: 'POST',
          body: xmlBody
        };
        
        request(options, (error, response, body) => {
          if (error) throw new Error(error);
          console.log(body);
          if (!error && response.statusCode == 200) {
            xmlParseString(body, (err, result) => {
              console.log(result)
              var prepay_id = getXMLNodeValue('prepay_id', body.toString("utf-8"));
              var tmp = prepay_id.split('[');
              var tmp1 = tmp[2].split(']');
              //签名
              // var _paySignjs = paysignjs(appid, nonce_str, 'prepay_id=' + tmp1[0], 'MD5', timeStamp);
              
              var jsapi_package = {
                appid: appid,
                partnerid: mchid,
                prepayid: tmp1[0],
                package: 'Sign=WXPay',
                noncestr: nonce_str,
                timestamp: timeStamp + ''
              }
  
              jsapi_package['sign'] = getReqSign(jsapi_package, mchsecret);
              
              resolve({
                out_trade_no,
                nonce_str,
                body: placeOrder['body'],
                attach: placeOrder['attach'],
                trade_type: placeOrder['trade_type'],
                total_fee: total_fee,
                sign: placeOrder['sign'],
                appid: placeOrder['appid'],
                mch_id: placeOrder['mch_id'],
                jsapi_package: jsapi_package
              });
              
            })
          } else {
            throw new LogicException().setShow(true).setMsg('下单失败').setCode('place_order_faild');
          }
          
        });
      }catch(e){
        throw new LogicException().setShow(true).setMsg('下单失败').setCode('place_order_faild');
      }
      
    });
  }

  // 简单对象 转 xml
  function simpleObjectToXml(obj){
    var formData = '<xml>\n';
    for(var i in obj){
      formData += `<${ i }>${ obj[i] }</${ i }>\n`;
    }
    formData += '</xml>';
    return formData;
  }

  // 获取 xml 的值
  function getXMLNodeValue(node_name,xml){
    var tmp = xml.split("<"+node_name+">");
    var _tmp = tmp[1].split("</"+node_name+">");
    return _tmp[0];
  }

  // 生成 商户订单号
  function generOutTradeNo() {
    return formatDate(new Date(), 'yyyyMMddhhmmssms') + '' + randomNum(6)
  }
   
   this.getReqSign = getReqSign;
   
   this.paysignjs = paysignjs;
   
   this.randomStr = randomStr;
   
   this.randomNum = randomNum;
   
   this.placeOrder = placeOrder;
   
   this.placeOrderForApp = placeOrderForApp;
   
   this.simpleObjectToXml = simpleObjectToXml;
   
   this.getXMLNodeValue = getXMLNodeValue;
   
   this.generOutTradeNo = generOutTradeNo;
  
}

function formatDate(date, format){
  var d = null;
  
  if(typeof date == 'string'){
    try {
      d = new Date(date);
      if(d.toString() == 'Invalid Date'){
        throw 'datetime is Invalid Date';
      }
    }catch(e){
      console.error(e);
      d = null;
    }
  }else if(date instanceof Date){
    d = date;
  }
  
  var _year = d.getFullYear();
  var _month = d.getMonth() + 1;
  var _date = d.getDate();
  
  var _day = d.getDay();
  
  var _hours = d.getHours();
  var _minutes = d.getMinutes();
  var _seconds = d.getSeconds();
  var _mseconds = d.getMilliseconds();
  
  var formatClone = format;
  return formatClone
    .replace(/yyyy/g, _year)
    .replace(/MM/g, _month > 9 ? _month : '0' + _month)
    .replace(/dd/g, _date > 9 ? _date : '0' + _date)
    .replace(/hh/g, _hours > 9 ? _hours : '0' + _hours)
    .replace(/mm/g, _minutes > 9 ? _minutes : '0' + _minutes)
    .replace(/ss/g, _seconds > 9 ? _seconds : '0' + _seconds)
    .replace(/ms/g, _mseconds > 9
      ? _mseconds > 99
        ? _mseconds
        : '0' + _mseconds
      : '00' + _mseconds);
}

exports = module.exports = new Wepay();
