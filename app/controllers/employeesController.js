"use strict";

const db = require("../models");
const employees = db.employees;
const logger = require("log4js").getLogger("employeesController");
const _ = require("lodash");

// Create and Save a new employee
exports.create = async (req, res) => {
    logger.debug(req);
    const employeeObj = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone
    };
    const result = await employees.create(employeeObj);
    return res.status(201).json(result);
};

// Retrieve all employees from the database.
exports.findAll = async (req, res) => {
    logger.debug(req);
    const result = await employees.findAll();
    logger.debug(result);
    return res.status(200).json(result);
};

// Find a single employee with an id
exports.findOne = async (req, res) => {
    logger.debug(req);
    return res.status(200).json(result);

};

// Update employee by the id in the request
exports.update = async (req, res) => {
    logger.debug(req);
    const employeeId = _.get(req, "swagger.params.employeeId");
    const employee = await employees.findOne({employeeId});
    logger.debug(employee);
    return res.status(200).json(employee);
}; 

// Delete an employee with the specified id in the request
exports.delete = async (req, res) => {

};

// Delete all employees from the database.
exports.deleteAll = async (req, res) => {
    logger.debug(req);
    const result = await employees.deleteAll();
    logger.debug(result);
    return res.status(200).json(result);
};