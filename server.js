"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const YAML = require("js-yaml");
const fs = require("fs");
const companiesSwaggerSpecs = YAML.safeLoad(fs.readFileSync(__dirname + "/app/api/companies-api.yml"));
const employeesSwaggerSpecs = YAML.safeLoad(fs.readFileSync(__dirname + "/app/api/employees-api.yml"));
const _ = require("lodash");
const apiErrorMiddleware = require("./app/middlewares/apiErrorMiddleware");
const swaggerTools = require("swagger-tools");
const swaggerOpts = {
    controllers: "./app/controllers",
    useStubs: false
};
const COMPANIES_API = {
    swaggerDoc: companiesSwaggerSpecs,
    path: "/"
};
const EMPLOYEES_API = {
    swaggerDoc: employeesSwaggerSpecs,
    path: "/"
};
const corsOptions = {
    origin: "http://localhost:8081"
};


app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome!" });
});

initSwagger({ app, basePath: COMPANIES_API.path, swaggerDoc: COMPANIES_API.swaggerDoc, returnCustomError: true });
initSwagger({ app, basePath: EMPLOYEES_API.path, swaggerDoc: EMPLOYEES_API.swaggerDoc, returnCustomError: true });

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

const db = require("./app/models");
db.sequelize.sync();

function initSwagger({ app, basePath, swaggerDoc, returnCustomError }) {
    swaggerTools.initializeMiddleware(swaggerDoc, (middleware) => {
        // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
        app.use(basePath, middleware.swaggerMetadata());

        // Validate Swagger requests
        app.use(
            basePath,
            middleware.swaggerValidator({
                validateResponse: process.env.NODE_ENV !== "production"
            })
        );

        // Route validated requests to appropriate controller
        app.use(basePath, middleware.swaggerRouter(swaggerOpts));

        if (returnCustomError) {
            app.use(basePath, apiErrorMiddleware);
        }

    });
}
