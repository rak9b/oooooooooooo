// // require("dotenv").config();
// // const { Sequelize } = require("sequelize");

// // const sequelize = new Sequelize(
// //     process.env.DB_NAME,
// //     process.env.DB_USER,
// //     process.env.DB_PASS,
// //     {
// //         host: process.env.DB_HOST,
// //         port: process.env.DB_PORT,
// //         dialect: "mysql",
// //         logging: false,
// //     }
// // );

// // module.exports = sequelize;
// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('samir_hosen', 'dbpbf34975162', 's1VX1@n+rRa0m5kllYQvFZ02', {
//     host: 'serverless-northeurope.sysp0000.db3.skysql.com',
//     port: 4026,
//     dialect: 'mysql',
//     dialectOptions: {
//         ssl: {
//             require: true,
//             rejectUnauthorized: false
//         },
//         connectTimeout: 60000
//     },
//     pool: {
//         max: 10,
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//     },

//     logging: false
// });

// module.exports = sequelize;


const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST || "127.0.0.1",
        port: process.env.DB_PORT || 3306,
        dialect: "mysql",

        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },

        dialectOptions: {
            connectTimeout: 60000
        },

        retry: {
            max: 3
        },

        logging: false
    }
);

module.exports = sequelize;