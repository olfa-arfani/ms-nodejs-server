"use strict";

const db = require("../models");
const employees = db.employees;
const Op = db.Sequelize.Op;
const logger = require("log4js").getLogger("employeesController");


// Create and Save a new employee
exports.create = async (req, res) => {
    logger.debug(req);
    const employeeObj = {
        firstName: "toto",
        lastName: "toto",
        phone: "123-234-4567"
    };
    await employees.create(employeeObj);
};

// Retrieve all employees from the database.
exports.findAll = async (req, res) => {
    logger.debug(req);
    const result = await employees.findAll();
    logger.debug(result);
};

// Find a single employee with an id
exports.findOne = async (req, res) => {
    logger.debug(req);

};

// Update a employee by the id in the request
exports.update = async (req, res) => {
    logger.debug(req);

}; 

// Delete an employee with the specified id in the request
exports.delete = async (req, res) => {

};

// Delete all employees from the database.
exports.deleteAll = async (req, res) => {

};