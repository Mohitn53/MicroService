require('dotenv').config()
const app = require('./src/app')
const connectToDb = require('./src/db/db')


connectToDb()

app.listen(3003,()=>{
    console.log("Order service is running on port 3003")
})