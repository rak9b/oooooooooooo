require('dotenv').config();
module.exports = {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_NAME: process.env.DB_NAME,
  MDB_CA_PEM: process.env.MDB_CA_PEM,
  PORT: process.env.PORT || 3000,
};