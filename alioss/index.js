/**
 * Created by muzin on 17-9-28.
 */
var OSS = require('ali-oss');

function AliOSSLight(){

    var client = null;

    var endpoint  = '';

    var region = '';

    var accessKeyId = '';

    var accessKeySecret = '';

    // 阿里云 内网地址，需要 阿里云服务器
    var innerEndPoint = '';

    /**
     * 默认Bucket名称
     * @type {string}
     */
    var defaultBucket = '';

    /**
     * 初始化sms数据访问对象
     * info {
     *     region: 区域,
     *     endpoint： 域名,
     *     accessKeyId： id,
     *     accessKeySecret： secret,
     *     bucket: bucket仓库
     *     innerEndPoint: 内网域名，需要阿里云服务器
     * }
     */
    this.init = function(info){

        if(info) {

            region = info.region;

            endpoint  = info.endpoint;

            accessKeyId = info.accessKeyId;

            accessKeySecret = info.accessKeySecret;

            defaultBucket = info.bucket;

            innerEndPoint = info.innerEndPoint

        }

        return this;

    };


    /**
     * 获取AliOSS客户端
     * @return {OSS}
     */
    this.getClient = function(){

        if(client == null){
            client = new OSS({
                region: region,
                endpoint : endpoint,
                accessKeyId : accessKeyId,
                accessKeySecret : accessKeySecret,
                bucket : defaultBucket
            });
        }
        return client;
    }

    /**
     * 获取Bucket列表
     * @param opts
     * @return { Promise }
     */
    this.listBuckets = async function(opts){
        var ret = null;
        try {
          ret = await this.getClient().listBuckets();
        }catch(e){
            console.log(e);
        }
        return ret;
    }

    /**
     * 获取默认Bucket的文件列表
     * @param opts {
     *      prefix 指定只列出符合特定前缀的文件
     *      marker 指定只列出文件名大于marker之后的文件
     *      delimiter 用于获取文件的公共前缀
     *      max-keys 用于指定最多返回的文件个数
     * }
     *
     * let result = await client.list();
     *    console.log(result);
     *    // 根据nextMarker继续列出文件。
     *    if (result.isTruncated) {
     *       let result = await client.list({
     *       marker: result.nextMarker
     *     });
     * }
     *
     * @return { Promise }
     */
    this.list = async function(opts){
        var ret = await this.getClient().list(opts || {});
        return ret;
    }

    /**
     * 获取Bucket列表
     * @param name
     * @return { Promise }
     */
    this.putBucket = async function(name){
        var ret = await this.getClient().putBucket(name);
        return ret;
    }

    /**
     * 获取Bucket列表
     * @param name
     * @return { Promise }
     */
    this.deleteBucket = async function(name){
        var ret = await this.getClient().deleteBucket(name);
        return ret;
    }

    /**
     * 上传普通文件
     * 指定文件的路径及本地文件的路径
     * @param name      文件在bucket上的名称
     * @param filepath  文件在本地的路径 或者 文件Buffer
     * @return {Promise}
     */
    this.put = async function(name, file){
        var ret = await this.getClient().put(name, file);
        return ret;
    }


    /**
     * 流式上传文件
     * 指定文件的路径及本地文件的路径
     * @param name      文件在bucket上的名称
     * @param filepath  文件在本地的路径 或者 文件Buffer
     * @return {Promise}
     */
    this.putStream = async function(name, stream){
        var ret = await this.getClient().putStream(name, stream);
        return ret;
    }

    /**
     * 获取文件
     * @param name
     * @returns {Promise<void>}
     */
    this.get = async function(name, localpath){
        var ret = await this.getClient().get(name, localpath);
        return ret;
    }

    /**
     * 获取文件Buffer
     * @param name
     * @returns {Promise<void>}
     */
    this.getBuffer = async function(name, localpath){
        var ret = await this.getClient().getBuffer(name);
        return ret;
    }

    /**
     * 判断文件是否存在
     * @param name
     * @returns {Promise<void>}
     */
    this.exists = async function(name){
        var ret = false;
        try {
            var result = await this.getClient().get(name);
            if (result.res.status == 200) {
                ret = true;
            }
        }catch(e){
            if(e.code == 'NoSuchKey'){
                ret = false;
            }
        }
        return ret;
    }


    /**
     * 删除Bucket中的文件列表
     * @param name
     * @return { Promise }
     */
    this.delete = async function(name){
        var ret = await this.getClient().delete(name);
        return ret;
    }
    /**
     * 拷贝文件
     *
     * 使用copy拷贝文件时分以下两种情况：
     *   同一个 Bucket。
     *   同一个 Region 下的两个不同 Bucket，此时源 Object 名字应为 '/bucket/object' 的形式。
     *
     * @param dest
     * @param src
     * @returns {Promise<*>}
     */
    this.copy = async function(dest, src){
        var ret = await this.getClient().copy(dest, src);
        return ret;
    }


    /**
     * 获取默认Bucket远程url
     * @returns {string}
     */
    this.getDefaultBucketRemoteUrlRoot = function(){
      return `https://${ defaultBucket }.${ region }.aliyuncs.com/`
    }

    /**
     * 获取默认Bucket内网url
     * @returns {string}
     */
    this.getDefaultBucketInnerUrlRoot = function(){
        return innerEndPoint + "/"
    }

}



exports = module.exports = AliOSSLight;
