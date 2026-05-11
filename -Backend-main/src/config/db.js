require('dotenv').config();
const fs = require('fs');
// const env = require('./env');
const mysql = require('mysql2/promise');
const env = require('./env')

// Add SSL if CA_PEM path is provided
if (env.MDB_CA_PEM) {
  connectionConfig.ssl = {
    ca: fs.readFileSync(env.MDB_CA_PEM, 'utf8'),
    rejectUnauthorized: false,
  };
}



const connectionConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 30000
}

// console.log({ connectionConfig });

const pool = mysql.createPool(connectionConfig);

module.exports = pool;

