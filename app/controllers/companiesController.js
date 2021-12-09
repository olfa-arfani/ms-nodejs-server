"use strict";

const db = require("../models");
const companees = db.companees;
const logger = require("log4js").getLogger("companiesController");


// Create and Save a new employee
exports.create = async (req, res) => {
    logger.debug(req);
    const companyObj = {
        name: req.body.name,
        email: req.body.email,
        website: req.body.website,
        phone: req.body.phone
    };
    const result = await companees.create(companyObj);
    return res.status(201).json(result);
};

// Retrieve all employees from the database.
exports.findAll = async (req, res) => {
    logger.debug(req);
    const result = await companees.findAll();
    logger.debug("findAll result=", result);
    return res.status(200).json(result);
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