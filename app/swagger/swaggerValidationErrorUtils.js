"use strict";

const _ = require("lodash");

function valErrorMapper(valErr, additionalInfo) {
    let msg = `property path=[${valErr.path.join(".")}], message=[${valErr.message}]`;
    if (additionalInfo) {
        Object.keys(additionalInfo).forEach((k) => {
            if (additionalInfo[k]) {
                msg += `, ${k}=[${additionalInfo[k]}]`;
            }
        });
    }
    return msg;
}

function isSwaggerError(err) {
    return err && err.failedValidation;
}

module.exports.isSwaggerError = isSwaggerError;

module.exports.isRequestValidationError = function isRequestValidationError(err) {
    return isSwaggerError(err) && !err.originalResponse;
};

module.exports.isResponseValidationError = function isResponseValidationError(err) {
    return isSwaggerError(err) && err.originalResponse;
};

module.exports.getMissingFieldsErrors = function getMissingFieldsErrors(err) {
    const errors = _.get(err, "results.errors");
    return _.filter(errors, (err) => err.code === "REQUIRED" || err.code === "OBJECT_MISSING_REQUIRED_PROPERTY");
};

module.exports.getEnumMismatchErrors = function getEnumMismatchErrors(err) {
    const errors = _.get(err, "results.errors");
    return _.filter(errors, (err) => err.code === "ENUM_MISMATCH");
};

module.exports.formatError = function(err, additionalInfo) {
    let message = err.message + " [";

    const errors = _.get(err, "results.errors");
    const warnings = _.get(err, "results.warnings");

    if (_.isArray(errors)) {
        message += errors.map((e) => valErrorMapper(e, additionalInfo)).join(",");
    }
    if (_.isArray(warnings)) {
        message += warnings.map((e) => valErrorMapper(e, additionalInfo)).join(",");
    }
    if (!errors && !warnings && additionalInfo) {
        message += JSON.stringify(additionalInfo);
    }
    message += " ]";

    return message;
};
