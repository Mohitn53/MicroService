require('dotenv').config()
const app = require('./src/app')
const connectToDb = require('./src/db/db')



connectToDb()

app.listen(3001,()=>{
    console.log("Server is running on port 3001")
})