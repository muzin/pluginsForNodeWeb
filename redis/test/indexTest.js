
var assert = require('assert')
var RedisLight = require('../index')

describe('Redis Light Test',()=>{

    it('Create Test', async ()=>{

       var redisLight = new RedisLight().init({
           host: '127.0.0.1',
           port: 6379,
       });

       console.log(redisLight.set.toString())

       var setResult = await redisLight.set('test1', 'test')
        console.log(setResult)
        var getResult = await redisLight.get('test1')

        console.log(getResult)



    })

})
