const cookieParser = require('cookie-parser')
const express = require('express')

const app = express()
app.use(cookieParser())
app.use(express.json())


module.exports = app