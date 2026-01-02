const mongoose = require('mongoose')

const connectToDb = async()=>{
    await mongoose.connect(process.env.MONGODB_URI).then(()=>{
        console.log("Connected to db")
    })
}

module.exports = connectToDb