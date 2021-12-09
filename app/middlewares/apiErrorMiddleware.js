"use strict";

const logger = require("log4js").getLogger("apiErrorMiddleware");
const swaggerValidationErrorUtils = require("../swagger/swaggerValidationErrorUtils");

function onErrorMiddleware(
    err,
    res
) {
    if (swaggerValidationErrorUtils.isSwaggerError(err)) {
        const message = swaggerValidationErrorUtils.formatError(err);

        if (swaggerValidationErrorUtils.isResponseValidationError(err)) {
            // detect if validation error is for the response (and not the request)
            logger.error("JSON response schema validation errors in response: \n %j", message);
            return res.status(400).json({});
        }
        logger.error("JSON schema validation errors in request for requestId: %j", message);
        return res.status(500).json({});
    }
    return res.status(500).json({});
}

module.exports = onErrorMiddleware;
