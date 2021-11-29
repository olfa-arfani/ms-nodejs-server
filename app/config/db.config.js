"use strict";

module.exports = {
    HOST: "localhost",
    USER: "root",
    PASSWORD: "1234*/12",
    DB: "demodb",
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};