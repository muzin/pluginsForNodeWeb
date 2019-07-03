
var request = require('request');

// 查询地址
var QUERY_URL = 'https://sp0.baidu.com/8aQDcjqpAAV3otqbppnN2DJv/api.php';

exports = module.exports = {

    /**
     * 根据ip 查询ip的所在地
     * @param ip
     * @result {
     *     ip: ip地址
     *     location: 地址
     * }
     */
    queryAddress: function(ip){
        return new Promise((resolve, reject)=>{
            var options = {
                method: "GET",
                url: QUERY_URL,
                qs: {
                    query: ip,
                    co: '',
                    resource_id: '6006',
                    t: new Date().getTime(),
                    ie: 'utf8',
                    oe: 'utf8',
                    cb: 'op_aladdin_callback',
                    format: 'json',
                    tn: 'baidu',
                    cb: 'jQuery1',
                    _: new Date().getTime(),
                }
            };
            request(options,(err, resp, body)=>{
                try {
                    var bodystr = body.substring(0, body.lastIndexOf('}') + 1).substring(body.indexOf('{'));
                    var bodyjson = JSON.parse(bodystr);

                    var location = bodyjson['data']['0']['location']
                    resolve({
                        ip,
                        location,
                    });
                }catch(e){
                    reject(e)
                }

            })
        });
    }
}
