"use strict";

module.exports = (sequelize, Sequelize) => {
    const Company = sequelize.define("company", {
        name: {
            type: Sequelize.STRING, unique: true, allowNull: false
        },
        website: {
            type: Sequelize.STRING
        },
        phone: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        }
    });

    return Company;
};