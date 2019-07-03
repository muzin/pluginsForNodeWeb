/**
 * Created by muzin on 17-9-21.
 */

var Redis = require('ioredis');
var CommandListJson = require('./commands.json');

var list = Object.keys(CommandListJson)

/**
 * RedisLight
 * 根据配置文件中的数据库信息，创建数据库访问实体，
 * 并提供访问数据库的工具
 */

function RedisLight(){


    /**
     * 记录数据库的连接等信息
     * 通过该数据库信息创建数据库实体
     */
    this.Config = null;

    /**
     * 数据库连接池
     */
    this.Pool = null;

    /**
     * 是否输出日志
     * @type {boolean}
     */
    this.IsLogOutput = true;

    /**
     * 数据库核心类的初始化方法
     * @param info {
     *     host: ip
     *     port: 端口号
     *     password: 密码
     *     db: 数据库
     * }
     */
    this.init = function(info){
        // info 存在 且 info是一个对象
        if(info && typeof info == 'object'){
            this.Config = info;
        }
        return this;
    };

    /**
     * 获取redis连接池
     */
    this.getRedisPool = function(){
        if(this.Pool == null)
            this.Pool = new Redis(this.Config);
        return this.Pool;
    };

    /**
     * get key
     * @param key
     * @returns {Promise<any>}
     */
    this.get = function(key){ };

    /**
     * set key
     *
     * redis.set('key', 100, 'EX', 10);
     *
     * @param key
     * @param data
     *
     * @returns {Promise<any>}
     */
    this.set = function(key, data){ };


    /**
     * del key
     * @param key
     * @returns {Promise<any>}
     */
    this.del = function(key){ };

    /**
     * 添加集合
     * @param key 集合名称
     * @param {Array|...} items
     */
    this.sadd = function(key, items){ };


    // 批处理 命令
    list.map((cmd)=>{
        this[cmd] = (function(){
            var argument = arguments;
            return new Promise((resolve, reject)=>{
                var redisPool = this.getRedisPool()
                var args = []
                for(var i = 0; i < argument.length; i++){
                    args.push(argument[i]);
                }
                args.push((err, result)=>{
                    if(err){
                        reject(err)
                    }else{
                        resolve(result)
                    }
                })
                redisPool[cmd].apply(redisPool, args)
            })
        }).bind(this)
    });


    /**
     * 获取redis管道
     */
    this.getPipe = function(){
        return this.getRedisPool().pipeline();
    };

    /**
     * 获取reids事务
     * @returns {*}
     */
    this.getMulti = function(){
        return this.getRedisPool().multi();
    };

    return this;
}


exports = module.exports = RedisLight;
