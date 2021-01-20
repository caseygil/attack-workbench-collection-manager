'use strict';

exports.initializeApp = async function() {
    const logger = require('./lib/logger');
    logger.info('ATT&CK Workbench Collection Manager app starting');

    // Configure the app
    logger.info('Configuring the app');
    const config = require('./config/config');

    // Create the express application
    logger.info('Starting express');
    const express = require('express');
    const app = express();

    // Allow CORS
    // TBD: Configure CORS for a specific origin
    const cors = require('cors');
    app.use(cors());

    // Compress response bodies
    const compression = require('compression');
    app.use(compression());

    // Set HTTP response headers
    const helmet = require("helmet");
    app.use(helmet());

    // Only use request logger for development environment
    if (config.app.env === 'development') {
        logger.info('Enabling HTTP request logging');
        const morgan = require('morgan');
        app.use(morgan('dev', { stream: logger.stream }));

        // Enable Swagger UI
        const swaggerUi = require('swagger-ui-express');
        const yaml = require('yamljs');
        const openApiDoc = yaml.load(config.openApi.specPath);
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDoc));

        // DO NOT ALLOW TO GO TO PRODUCTION
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    }

    // Set up the static routes
    app.use(express.static('public'));
    app.use('/collections', express.static('collections'))

    // Set up the api routes
    logger.info('Creating the routes');
    const routes = require('./routes');
    app.use(routes);

    // Make the config and logger accessible from the app
    app.set('config', config);
    app.set('logger', logger);

    return app;
}
