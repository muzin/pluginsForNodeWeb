
var request = require("request");
var crypto = require('crypto');
var xmlParseString = require('xml2js').parseString;

function Wechat() {
  
  var appid = null;
  var appsecret = null;
  var notify_url = null;
  
  /**
   * 初始化 微信支付
   * @param opts
   */
  this.init = function(opts){
    appid = opts.appid;
    appsecret = opts.appsecret;
    notify_url = opts.notify_url;
  }
  
  /**
   * web 授权 借口
   * @param code
   * @returns {Promise<any>}
   * {
   *   access_token
   *   expires_in
   *   refresh_token
   *   openid
   *   scope
   * }
   */
  function webAuth(code){
    return new Promise((resolve, reject)=>{
      var options = {
        url: 'https://api.weixin.qq.com/sns/oauth2/access_token',
        method: 'POST',
        qs: {
          appid: appid,
          secret: appsecret,
          code: code,
          grant_type: 'authorization_code'
        }
      };
      
      request(options, (error, response, body)=>{
        if (error){
          reject(error)
        }else{
          console.log(body);
          try{
            body = JSON.parse(body);
          } catch(e){  }
          resolve(body)
        };
      });
      
    });
    
  }
  
  /**
   * 刷新微信网页授权 access token
   * @param appid
   * @param refresh_token
   */
  function refreshWebAuthAccessToken(refresh_token){
    return new Promise((resolve, reject)=>{
      var options = {
        url: 'https://api.weixin.qq.com/sns/oauth2/refresh_token',
        method: 'POST',
        qs: {
          appid: appid,
          refresh_token: refresh_token,
          grant_type: 'refresh_token'
        }
      };
      
      request(options, (error, response, body)=>{
        if (error) throw new Error(error);
        console.log(body);
        try{
          body = JSON.parse(body);
        } catch(e){  }
        resolve(body)
      });
      
    });
    
  }
  
  // 获取 普通access token
  function getAccessToken(){
    return new Promise((resolve, reject)=>{
      var options = {
        url: 'https://api.weixin.qq.com/cgi-bin/token',
        method: 'GET',
        qs: {
          appid: appid,
          secret: appsecret,
          grant_type: 'client_credential'
        }
      };
    
      request(options, (error, response, body)=>{
        if (error){
          reject(error)
        }else{
          console.log(body);
          try{
            body = JSON.parse(body);
          } catch(e){  }
          resolve(body)
        };
      });
    
    });
  }
  
  /**
   * 获取 用户信息 为了 web auth
   * @param openid
   * @param access_token
   * @param lang
   * @returns {Promise<any>}
   * {
   *   openid,
   *   nickname,
   *   sex,
   *   province,
   *   city,
   *   country,
   *   headimgurl,
   *   unionid
   * }
   */
  function getUserInfoForWebAuth(openid, access_token, lang='zh_CN'){
    return new Promise((resolve, reject)=>{
      var options = {
        url: 'https://api.weixin.qq.com/sns/userinfo',
        method: 'GET',
        qs: {
          access_token: access_token,
          openid: openid,
          lang: lang
        }
      };
      
      request(options, (error, response, body)=>{
        if (error){
          reject(error)
        }else{
          console.log(body);
          try{
            body = JSON.parse(body);
          } catch(e){  }
          resolve(body)
        };
      });
      
    });
  }
  
  // 获取 网页授权 用户信息
  function getWebAuthUserInfo(openid, access_token, lang='zh_CN'){
    return new Promise((resolve, reject)=>{
      var options = {
        url: 'https://api.weixin.qq.com/sns/userinfo',
        method: 'GET',
        qs: {
          access_token: access_token,
          openid: openid,
          lang: lang
        }
      };
      
      request(options, (error, response, body)=>{
        if (error){
          reject(error)
        }else{
          console.log(body);
          try{
            body = JSON.parse(body);
          } catch(e){  }
          resolve(body)
        };
      });
      
    });
  }
  
  // 获取 用户信息
  function getUserInfo(openid, access_token, lang='zh_CN'){
    return new Promise((resolve, reject)=>{
      var options = {
        url: 'https://api.weixin.qq.com/cgi-bin/user/info',
        method: 'GET',
        qs: {
          access_token: access_token,
          openid: openid,
          lang: lang
        }
      };
      
      request(options, (error, response, body)=>{
        if (error){
          reject(error)
        }else{
          console.log(body);
          try{
            body = JSON.parse(body);
          } catch(e){  }
          resolve(body)
        };
      });
      
    });
  }
  
  /**
   * 微信获取jsTicket
   * @param access_token
   */
  function getJsapiTicket(access_token){
    return new Promise((resolve, reject)=>{
      var options = {
        url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
        method: 'GET',
        qs: {
          access_token: access_token,
          type: 'jsapi'
        }
      };
      
      request(options, (error, response, body)=>{
        if (error) throw new Error(error);
        console.log(body);
        try{
          body = JSON.parse(body);
        } catch(e){  }
        resolve(body)
      });
      
    });
    
  }
  
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
  
  // 简单对象 转 xml
  function simpleObjectToXml(obj){
    var formData = '<xml>\n';
    for(var i in obj){
      formData += `<${ i }>${ obj[i] }</${ i }>\n`;
    }
    formData += '</xml>';
    return formData;
  }
  
  this.webAuth = webAuth;
  
  this.getAccessToken = getAccessToken;
  
  this.getJsapiTicket = getJsapiTicket;
  
  this.getWebAuthUserInfo = getWebAuthUserInfo;
  
  this.getUserInfo = getUserInfo;
  
  this.randomStr = randomStr;
  
  this.randomNum = randomNum;
  
  this.simpleObjectToXml = simpleObjectToXml;
  
  
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

exports = module.exports = new Wechat();
