const { authJwt } = require("../middlewares");

module.exports = app => {
  const Company = require("../controllers/companiesController");

  var router = require("express").Router();

  // Create a new Company
  router.post(
    "/create",
    [authJwt.verifyToken, authJwt.isAdmin],
    Company.create
  );

  // Retrieve all Company
  router.get("/list", Company.findAll);

  // Retrieve a single Company with id
  router.get("/:id", Company.findOne);

  // Update a Company with id
  router.post(
    "/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    Company.update
  );

  // Delete a Company with id
  router.delete(
    "/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    Company.delete
  );

  app.use('/api/company', router);
};