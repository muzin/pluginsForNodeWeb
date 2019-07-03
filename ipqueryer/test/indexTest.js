
var assert = require('assert')
var IpQueryer = require('../index')

describe('IP 查询测试',()=>{

    it('queryAddress Test', async ()=>{

        var ip = '47.93.53.112';
        var location = '北京市北京市 阿里云'
        var queryResult = await IpQueryer.queryAddress(ip)

        console.log(queryResult)

        assert('ip' in queryResult, true)
        assert('location' in queryResult, true)

        assert(ip == queryResult.ip, true)
        assert(location == queryResult.location, true)

    })

})
