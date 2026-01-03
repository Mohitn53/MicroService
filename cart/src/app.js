const cookieParser = require('cookie-parser')
const express = require('express')
const cartRoutes = require("../src/routes/cart.routes")
const app = express()
app.use(cookieParser())
app.use(express.json())

app.use('/cart',cartRoutes)

module.exports = app