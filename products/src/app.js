const cookieParser = require('cookie-parser')
const express = require('express')
const productRoutes = require('./routes/products.routes')
const app = express()
app.use(express.json())
app.use(cookieParser())


app.use('/products',productRoutes)
module.exports = app