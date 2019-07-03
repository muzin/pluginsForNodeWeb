/**
 * Created by muzin on 17-9-21.
 */
var mysql = require('mysql');

/**
 * MysqlLight 轻量型 mysql 操作
 * 根据配置文件中的数据库信息，创建数据库访问实体，
 * 并提供访问数据库的工具
 */
function MysqlLight(){

    /**
     * 记录数据库的连接等信息
     * 通过该数据库信息创建数据库实体
     */
    this.config = null;

    /**
     * 数据库连接池
     */
    this.dbPool = null;

    /**
     * 是否输出日志
     * @type {boolean}
     */
    this.is_log_out = true;

    /**
     * 数据库核心类的初始化方法
     * @param info {
     *     host : 主机
     *     port : 端口号
     *     user : 用户名
     *     password : 密码
     *     database : 数据库名称
     *     connectionLimit : 最大连接数
     *     charset : 字符串编码
     * }
     */
    this.init = function(config){
        this.config = config;
    };

    /**
     * 获取数据库连接池
     */
    this.getDbPool = function(){
        if(this.dbPool == null)
            this.dbPool = mysql.createPool(this.dbInfo);
        return this.dbPool;
    };

    /**
     * 重新加载数据源
     * @param info 数据库配置信息
     */
    this.reloadDbSource = function(info){
        var newConfig = this.config;
        if(info){
            if(typeof info == 'object'){
                newConfig = info;
                this.config = info;
                this.dbPool = mysql.createPool(newConfig);
            }else{
                console.warn('[Warn] The info is bad when reload database source.');
            }
        }else{
            this.dbPool = mysql.createPool(newConfig);
        }
    };

    /**
     * 从连接池中获取数据库连接
     * @param err
     * @param callback
     */
    this.getConnection = function(callback){
        this.getDbPool().getConnection(function(err,connection){
            callback(err, connection);
        });
    }

    /**
     * * 打印sql信息
     *
     * @param $sql      sql
     * @param $param    sql的参数
     * @param $err      sql执行的错误
     * @param $result   sql执行结果
     * @param $usetime  sql开始执行的时间
     */
    this.printSql = function printSql($sql, $param, $err, $result, $usetime){

        if(typeof $sql == 'string'){
            console.log("[SQL] ===> : " + $sql);
            console.log("[Param] : " + JSON.stringify($param));
            if($err){
                console.log("[Error]: ");
                console.log($err);
            }else{
                console.log("[Result]: ");
                console.log($result);
            }
        }else{
            console.log(`[SQL Name] : ${ $sql.name || '' }`);
            console.log("[SQL] ===> : " + $sql.sql);
            console.log("[Param] : " + JSON.stringify($sql.values));
            if($err){
                console.log("[Error]: ");
                console.log($err);
            }else{
                console.log("[Result]: ");
                console.log($result);
            }
        }
        var endTime = new Date().getTime();
        console.log('[Use Time]: ' + (endTime - $usetime) + 'ms');

    }

    /**
     * 执行sql
     * @param conn      数据库连接
     * @param sql
     * @param param
     * @param callback
     *
     * @deprecated 暂时废弃
     */
    this.exec = function(conn, sql,param,callback){

        if(!this.inited){
            console.log('[Error] DBCore must be initialized.');
            return;
        }
        var $conn
        var $sql = sql;
        var $param = null;
        var $callback = null;

        if(arguments.length < 2){
            console.error('[Error] Param is Error.');

            return ;
        }else if(arguments.length == 3){
            if(typeof param == 'function'){
                var $callback = param;
            }else{
                console.error('[Error] Callback is None.');
                return;
            }
        }else{
            $param = param;
            $callback = callback;
        }

        this.getConnection(function(err, conn){

            if(this.isLogOutput){
                var _p = new Date().getTime();
            }

            var args = [];

            args.push($sql);

            if($param) args.push($param);

            args.push(function(err,result){
                conn.release();
                $callback(err,result);
                if(this.isLogOutput)
                    this.printSql($sql,$param,err, result, _p);
            });

            conn.query.apply(conn, args);

        });

    }

    /**
     * 执行sql
     */
    this.execSql = function(sql, param, callback){

        var $sql = sql;
        var $param = null;
        var $callback = null;

        if(arguments.length < 1){
            console.error('[Error] Param is Error.');

            return ;
        }else if(arguments.length == 2){
            if(typeof param == 'function'){
                $callback = param;
            }else{
                $param = param;
                $callback = function(){}
            }
        }else{
            $param = param;
            $callback = callback;
        }

        this.getConnection((err, conn) => {

            var _p;

            if(this.isLogOutput)
                _p = new Date().getTime();

            var args = [];

            args.push($sql);

            if($param) args.push($param);

            args.push((err,result, field) => {
                conn.release();
                $callback(err,result, field);
                if(this.isLogOutput)
                    this.printSql($sql,$param,err, result, _p);
            });

            conn.query.apply(conn, args);

        });
    },

    /**
     * 获取数据库的当前时间
     */
    this.databaseTime = function(callback){
        this.execSql('select now() time',function(err, result){
            if(err){
                callback(null);
            } else{
                callback(result[0].time);
            }
        });
    }

    return this;
}




exports = module.exports = MysqlLight;
