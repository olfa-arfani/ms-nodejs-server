const { authJwt } = require("../middlewares");

module.exports = app => {
  const Employee = require("../controllers/employeesController");

  var router = require("express").Router();

  // Create a new Employee
  router.post(
    "/create",
    [authJwt.verifyToken, authJwt.isAdmin],
    Employee.create
  );

  // Retrieve all Employee
  router.get("/list", Employee.findAll);

  // Retrieve a single Employee with id
  router.get("/:id", Employee.findOne);

  // Update a Employee with id
  router.post(
    "/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    Employee.update
  );

  // Delete a Employee with id
  router.delete(
    "/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    Employee.delete
  );

  app.use('/api/employee', router);
};