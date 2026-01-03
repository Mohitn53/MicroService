const cookieParser = require('cookie-parser')
const express = require('express')
const orderRoutes = require('../src/routes/order.routes')
const app = express()

app.use(express.json())
app.use(cookieParser)

app.use('/orders',orderRoutes)


module.exports = app