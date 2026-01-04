
require('dotenv').config();
const app = require('./app');
const connectToDb = require('./db/db');

connectToDb();

app.listen(3003, () => {
  console.log('Order service is running on port 3003');
});
