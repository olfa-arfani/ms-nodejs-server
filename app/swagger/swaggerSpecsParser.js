"use strict";

const _ = require("lodash");
const specs = require("swagger-tools/lib/specs");

/**
 * Swagger v2 specs parser
 */
class SwaggerSpecsParser {
    constructor(swaggerSpecs) {
        this._swaggerSpecs = swaggerSpecs;
    }

    _createOperationMetadata(path, method, methodSpecs) {
        const opMetdata = {
            fullPath: (this._swaggerSpecs.basePath && this._swaggerSpecs.basePath !== "/" ? this._swaggerSpecs.basePath : "") + path,
            path,
            method,
            isGET: method === "GET",
            isPOST: method === "POST",
            parameters: [],
            produces: methodSpecs.produces || this._swaggerSpecs.produces,
            consumes: methodSpecs.consumes || this._swaggerSpecs.consumes,
            headers: [],
            specPath: ["paths", path, method], // used for error reporting
            responses: methodSpecs.responses
        };

        if (opMetdata.produces) {
            opMetdata.headers.push({
                name: "Accept",
                value: `${opMetdata.produces
                    .map(function(value) {
                        return value;
                    })
                    .join(", ")}`
            });
        }

        if (opMetdata.consumes) {
            opMetdata.headers.push({ name: "Content-Type", value: `${opMetdata.consumes}` });
        }

        let params = [];
        if (_.isArray(methodSpecs.parameters)) {
            params = methodSpecs.parameters;
        }

        _.forEach(params, (parameter, idx) => this._fillParameter(opMetdata, parameter, idx));
        return opMetdata;
    }

    getOperations() {
        if (this.operations) {
            return this.operations;
        }
        this.operations = {};
        for (const p of Object.keys(this._swaggerSpecs.paths)) {
            const operationSpecs = this._swaggerSpecs.paths[p];
            for (const m of Object.keys(operationSpecs)) {
                const methodSpecs = operationSpecs[m];
                this.operations[methodSpecs.operationId] = this._createOperationMetadata(p, m, methodSpecs);
            }
        }
        return this.operations;
    }

    // Same as getOperations except the schema is fully resolved
    async getResolvedOperations() {
        if (!this._swaggerSpecs._resolved) {
            this._swaggerSpecs = await this._resolveSpecs();
            this._swaggerSpecs._resolved = true;
        }
        return this.getOperations();
    }

    _fillParameter(opMetdata, parameter, idx) {
        //Ignore parameters which contain the x-exclude-from-bindings extension
        if (parameter["x-exclude-from-bindings"] === true) {
            return;
        }

        parameter.specPath = opMetdata.specPath.concat("parameters", idx + "");

        if (_.isString(parameter.$ref)) {
            const segments = parameter.$ref.split("/");
            parameter = this._swaggerSpecs.parameters[segments.length === 1 ? segments[0] : segments[2]];
        }
        parameter.camelCaseName = _.camelCase(parameter.name);
        if (parameter.enum && parameter.enum.length === 1) {
            parameter.isSingleton = true;
            parameter.singleton = parameter.enum[0];
        }

        switch (parameter.in) {
            case "body":
                parameter.isBodyParameter = true;
                break;
            case "path":
                parameter.isPathParameter = true;
                break;
            case "query":
                parameter.isQueryParameter = true;
                break;
            case "header":
                parameter.isHeaderParameter = true;
                break;
            case "formData":
                parameter.isFormParameter = true;
                break;
        }
        parameter.cardinality = parameter.required ? "" : "?";
        opMetdata.parameters.push(parameter);
    }

    _resolveSpecs() {
        return new Promise((resolve, reject) => {
            specs.v2.resolve(this._swaggerSpecs, undefined, (err, doc) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(doc);
            });
        });
    }
}

module.exports = SwaggerSpecsParser;
