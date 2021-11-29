"use strict";

const fs = require("fs");
const path = require("path");
const YAML = require("js-yaml");
const _ = require("lodash");
const swaggerTools = require("swagger-tools");

function loadFile(aFile) {
    if (aFile.endsWith("yaml") || aFile.endsWith("yml")) {
        return YAML.safeLoad(fs.readFileSync(aFile));
    }
    return JSON.parse(fs.readFileSync(aFile));
}

function loadRemoteRefs(basePath, def, loadedFiles = [], isParsingRemote = false, definitions) {
    if (_.isUndefined(def)) {
        return;
    }
    Object.keys(def).forEach((k) => {
        const v = def[k];

        if (k !== "$ref" && !_.isObject(v)) {
            return;
        }

        if (_.isObject(v)) {
            return loadRemoteRefs(basePath, v, loadedFiles, isParsingRemote, definitions || def);
        }

        const resPattern = /^(.*)#(.+)$/;
        const m = resPattern.exec(v);
        if (!m) {
            return;
        }
        const f = m[1];
        const isRemoteIncludes = f.length > 0;
        if (isRemoteIncludes) {
            loadRemoteFile({ loadedFiles, f, basePath, definitions, def });
            def[k] = `#/definitions${m[2]}`;
        } else if (isParsingRemote && !m[2].startsWith("/definitions")) {
            def[k] = `#/definitions${m[2]}`;
        }
    });
}

function loadRemoteFile({ loadedFiles, f, basePath, definitions, def }) {
    if (loadedFiles.includes(f)) {
        return;
    }

    const resolvedDefs = loadFile(path.join(basePath, f));
    loadedFiles.push(f);
    loadRemoteRefs(basePath, resolvedDefs, loadedFiles, true, definitions);
    _.merge(definitions || def, resolvedDefs);
}

function loadSwaggerSpecs(swaggerSpecsPath) {
    const nSpecPath = path.resolve(swaggerSpecsPath);
    const specs = loadFile(nSpecPath);
    loadRemoteRefs(path.dirname(nSpecPath), specs.definitions);
    return specs;
}

module.exports.loadSwaggerSpecs = loadSwaggerSpecs;

function filterSpecs(swaggerSecs, pathFilterFunc) {
    if (!pathFilterFunc) {
        return;
    }
    for (const path of Object.keys(swaggerSecs.paths)) {
        if (pathFilterFunc(path) !== true) {
            delete swaggerSecs.paths[path];
        }
    }
}

function loadSpecsFromFiles(swaggerSpecsPaths, specCustomizer, pathFilterFunc) {
    const swaggerSpecs = {};
    for (let idx = 0; idx < swaggerSpecsPaths.length; idx++) {
        const sPath = swaggerSpecsPaths[idx];
        const aSpec = loadSwaggerSpecs(sPath);
        _.merge(swaggerSpecs, aSpec);
        if (idx > 0) {
            swaggerSpecs.info.description += " - " + aSpec.info.description;
            swaggerSpecs.info.title += " - " + aSpec.info.title;
            // for version suppose it is the same
        }
    }

    filterSpecs(swaggerSpecs, pathFilterFunc);
    if (specCustomizer) {
        specCustomizer(swaggerSpecs);
    }
    return swaggerSpecs;
}

function initMiddleware({ app, swaggerSpecs, beforeSwaggerMiddlewares = [], beetweenSwaggerMiddlewares = [], afterSwaggerMiddlewares = [], basePath, swaggerOpts }) {
    swaggerTools.initializeMiddleware(swaggerSpecs, (middleware) => {
    // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
        app.use(basePath, middleware.swaggerMetadata());

        for (const middleware of beforeSwaggerMiddlewares) {
            app.use(basePath, middleware);
        }

        // Validate Swagger requests
        app.use(
            basePath,
            middleware.swaggerValidator({
                validateResponse: process.env.NODE_ENV !== "production"
            })
        );
        //middleware we want executed beetween swaggerValidator and controllers middlewares
        for (const middleware of beetweenSwaggerMiddlewares) {
            app.use(basePath, middleware);
        }

        // Route validated requests to appropriate controller
        app.use(basePath, middleware.swaggerRouter(swaggerOpts));
        for (const middleware of afterSwaggerMiddlewares) {
            app.use(basePath, middleware);
        }
    });
}

module.exports.init = function initSwagger({
    app,
    basePath,
    swaggerSpecsPath,
    swaggerSpecsPaths,
    pathFilterFunc,
    swaggerOpts,
    specCustomizer,
    beforeSwaggerMiddlewares = [],
    beetweenSwaggerMiddlewares = [],
    afterSwaggerMiddlewares = []
}) {
    const swaggerSpecs = loadSpecsFromFiles(swaggerSpecsPaths || [swaggerSpecsPath], specCustomizer, pathFilterFunc);
    if (!basePath) {
        basePath = swaggerSpecs.basePath;
        swaggerSpecs.basePath = "/";
    }

    initMiddleware({
        swaggerSpecs,
        app,
        beforeSwaggerMiddlewares,
        beetweenSwaggerMiddlewares,
        afterSwaggerMiddlewares,
        basePath,
        swaggerOpts
    });
};


module.exports.initFromHandlers = function initFromHandlers({
    app,
    basePath,
    swaggerSpecsPath,
    swaggerSpecsPaths,
    pathFilterFunc,
    specCustomizer,
    handlers,
    beforeSwaggerMiddlewares = [],
    beetweenSwaggerMiddlewares = [],
    afterSwaggerMiddlewares = []
}) {
    const swaggerSpecs = loadSpecsFromFiles(swaggerSpecsPaths || [swaggerSpecsPath], specCustomizer, pathFilterFunc);
    if (!basePath) {
        basePath = swaggerSpecs.basePath;
        swaggerSpecs.basePath = "/";
    }

    if (!basePath) {
        throw new Error("Api base path must be defined either in the swagger specifications or explicitly set");
    }

    const swaggerOpts = {
        controllers: swaggerControllerFactory(
            handlers,
            _.values(swaggerSpecs.paths).reduce((acc, val) => acc.concat(_.values(val).map((m) => m.operationId)), [])
        ),
        useStub: false
    };

    initMiddleware({
        swaggerSpecs,
        app,
        basePath,
        beforeSwaggerMiddlewares,
        beetweenSwaggerMiddlewares,
        afterSwaggerMiddlewares,
        swaggerOpts
    });
};
