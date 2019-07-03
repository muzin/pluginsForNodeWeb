
var MongoClient = require('mongodb').MongoClient;

var MongoDBLight = function() {

    // ip
    this.host = '';

    // 端口号
    this.port = 0;

    // 用户名
    this.username = '';

    // 密码
    this.password = '';

    // 数据库名称
    this.db = '';


    this.url = '';


    // 数据库对象
    this.dbobj = {};

    /**
     * 初始化mongo
     * config ： {
     *     host: IP地址
     *     port: 端口
     *     username: 用户名
     *     password: 密码
     *     db: 数据库名称
     * }
     */
    this.init = function init(config){
        this.host = config.host || '127.0.0.1';
        this.port = config.port || 27017;
        this.username = config.username || '';
        this.password = config.password || '';
        this.db = config.db || '';
        this.url = this.getUrl();

        return this;
    }

    /**
     * 获取连接url
     * @param config
     * @returns {string}
     */
    this.getUrl = function getUrl(config={}){
        var host = config.host || this.host;
        var port = config.port || this.port;
        var username = config.username || this.username;
        var password = config.password || this.password;
        var db = config.db || this.db;

        return `mongodb://${ username || '' }${ password? (':' + password) : '' }@${ host }${ port ? (':' + port) : ''}/${ db }`;
    }

    /**
     * 获取数据库连接
     * @param dbname 数据库名称
     * @returns {Promise<any>}
     */
    this.getDB = function getDB(dbname='') {
        return new Promise((resolve, reject)=>{

          dbname = dbname || (this.db + '');

          if(dbname in this.dbobj){
              var dbase = this.dbobj[dbname];
              resolve(dbase);
          } else {

              var url = this.getUrl({db: dbname})
              MongoClient.connect(url, { useNewUrlParser: true}, (err, db)=>{
                  if(err){
                      reject(err)
                      return
                  }

                  var dbase = db.db(dbname);

                  this.dbobj[dbname] = dbase;

                  resolve(dbase);
              })
          }

        })
    }

    /**
     * 查询
     * @param cname
     * @returns {function(*=, *=): Promise<any>}
     */
    this.find = function(cname){
        var _self = this;
        return function (collection, options) {
            return new Promise(async (resolve, reject)=>{
                var db = await _self.getDB(options && options.db)
                db.collection(cname).find(collection, options).toArray((err, data)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(data);
                    }
                })
            })
        }
    }


    /**
     * 查询一条
     * @param cname
     * @returns {function(*=, *=): Promise<any>}
     */
    this.findOne = function(cname){
        var _self = this;
        return function (collection, options) {
            return new Promise(async (resolve, reject)=>{
                var db = await _self.getDB(options && options.db)
                db.collection(cname).findOne(collection, options, (err, data)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(data);
                    }
                })
            })
        }
    }


    /**
     * 插入数据
     * @param cname
     * @returns {function(*=, *=): Promise<any>}
     */
    this.insert = function(cname){
        var _self = this;
        return function (docs, options) {
            return new Promise(async (resolve, reject)=>{
                var db = await _self.getDB(options && options.db)

                if(docs instanceof Array){
                    db.collection(cname).insertMany(docs, options, (err, data)=>{
                        if(err){
                            reject(err);
                        }else{
                            resolve(data);
                        }
                    })
                }else{
                    db.collection(cname).insertOne(docs, options, (err, data)=>{
                        if(err){
                            reject(err);
                        }else{
                            resolve(data);
                        }
                    })
                }



            })
        }
    }


    /**
     * 更新数据
     * @param cname
     * @returns {function(*=, *=, *=): Promise<any>}
     */
    this.update = function(cname){
        var _self = this;
        return function (filter, update, options) {
            return new Promise(async (resolve, reject)=>{
                var db = await _self.getDB(options && options.db)
                db.collection(cname).updateMany(filter, update, options, (err, data)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(data);
                    }
                })
            })
        }
    }


    /**
     * 删除数据
     * @param cname
     * @returns {function(*=, *=): Promise<any>}
     */
    this.delete = function(cname){
        var _self = this;
        return function (docs, options) {
            return new Promise(async (resolve, reject)=>{
                var db = await _self.getDB(options && options.db)
                db.collection(cname).deleteMany(docs, options, (err, data)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(data);
                    }
                })
            })
        }
    }

    /**
     * 聚合
     * @param cname
     * @returns {function(*=, *=): Promise<any>}
     */
    this.aggregate = function(cname){
        var _self = this;
        return function (pipeline, options) {
            return new Promise(async (resolve, reject)=>{
                var db = await _self.getDB(options && options.db)
                db.collection(cname).aggregate(pipeline, options, (err, data)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(data);
                    }
                })
            })
        }
    }

}

exports = module.exports = MongoDBLight;
