"use strict";
const Company = require("./company.model");

module.exports = (sequelize, Sequelize) => {
    const Employee = sequelize.define("employee", {
        employeeId: {
            type: Sequelize.STRING, unique: true, allowNull: false
        },
        firstName: {
            type: Sequelize.STRING
        },
        lastName: {
            type: Sequelize.STRING
        },
        phone: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        }
    });

    return Employee;
};