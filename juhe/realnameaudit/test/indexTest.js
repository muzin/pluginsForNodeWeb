
var assert = require('assert')
var realnameaudit = require('../index')

describe('实名认证',()=>{

    it('实名认证 Test', async ()=>{

        // var queryResult = await realnameaudit.query("", '')
        // console.log(queryResult)
        // assert('match' in queryResult, true)
        // assert(queryResult.match, true)


        queryResult = await realnameaudit.query("", '')
        console.log(queryResult)
        assert('match' in queryResult, true)
        assert(queryResult.match == null, true)
    })

})
