const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    desc:String,
    price:{
        amount:{
            type:Number,
            required:true
        },
        currency:{
            type:String,
            enum:["USD","INR"],
            default:"INR"
        },
    },
    seller:{
            type:mongoose.Schema.Types.ObjectId,
            required:true
        },
    images:[{
            url:String,
            thumbnail:String,
            id:String
        }]
    
})

productSchema.index({title:'text',desc:'text'})

const productModel = mongoose.model("product",productSchema)
module.exports = productModel