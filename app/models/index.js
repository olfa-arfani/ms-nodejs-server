const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: false,

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.employees = require("./employee.model.js")(sequelize, Sequelize);
db.companees = require("./company.model.js")(sequelize, Sequelize);
db.employees.belongsTo(db.companees, {foreignKey: 'fk_companyname', targetKey: 'name'});
module.exports = db;
