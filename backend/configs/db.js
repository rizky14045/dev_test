import knex from 'knex'

const db = knex({
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root',
    password: 'root', 
    database: 'dev_test'
  }
});

export default db
