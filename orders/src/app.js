const cookieParser = require('cookie-parser');
const express = require('express');
const orderRoutes = require('./routes/order.routes');

const app = express();

app.use(express.json());
app.use(cookieParser()); // ✅ FIXED

app.use('/api/orders', orderRoutes); // ✅ FIXED

module.exports = app;
