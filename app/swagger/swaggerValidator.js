"use strict";

const _ = require("lodash");
const swaggerValidationErrorUtils = require("./swaggerValidationErrorUtils");
const validators = require("swagger-tools/lib/validators");

class SwaggerValidationError extends Error {
    constructor(...args) {
        super(...args);
        Error.captureStackTrace(this, SwaggerValidationError);
    }
}

module.exports.validate = function(schema, path, val) {
    try {
        validators.validateRequiredness(val, schema.required);
        validators.validateSchemaConstraints("2.0", schema, path, val);
        if (_.isObject(val)) {
            validators.validateAgainstSchema(schema.schema ? schema.schema : schema, val);
        }
    } catch (err) {
        if (swaggerValidationErrorUtils.isSwaggerError(err)) {
            throw new SwaggerValidationError(swaggerValidationErrorUtils.formatError(err, { paramName: schema.name, paramPath: path.join(".") }));
        }
        throw err;
    }
};

module.exports.SwaggerValidationError = SwaggerValidationError;
