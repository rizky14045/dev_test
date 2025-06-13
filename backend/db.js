// db.js
const db = require('knex')({
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root',
    password: 'root', 
    database: 'dev_test'
  }
});

module.exports = db;
