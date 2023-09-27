const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'My API',
            version: '1.0.0',
            description: 'My API documentation',
        },
    },
    apis: ['./routes/*.js', './models/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;
