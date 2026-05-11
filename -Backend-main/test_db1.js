const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('md-nazmul-k0eg', 'dbpwf25981266', 'A7MPgg45', {
    host: 'serverless-eu-west-2.sysp0000.db1.skysql.com',
    port: 4017,
    dialect: 'mysql',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

sequelize.authenticate()
    .then(() => console.log('Connected!'))
    .catch(err => console.error('Error:', err));
