
var assert = require('assert')
var MongoDbLight = require('../index')

describe('MongoDB Light Test',()=>{

    it('Create Test', async ()=>{

        // require input
        var mongoDbLight = new MongoDbLight().init({
            host: '',
            port: 27017,
            username: '',
            password: '',
            db: ''
        })


        console.log(mongoDbLight)

        var insertResult = await mongoDbLight.insert('order')([{
            name: '1'
        },{
            name: '1'
        }])

        var orderlist = await mongoDbLight.find('order')({})

        console.log(orderlist)



    })

})
